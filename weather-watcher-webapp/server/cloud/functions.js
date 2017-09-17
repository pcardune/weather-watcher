import moment from 'moment-mini';
import {NOAAPoint, NOAAGridDataForecast} from './noaa';

let db;
export async function init(database) {
  db = database;
}
/**
 * Fetches the noaa point for the given comparison point object from firebase. If no
 * noaa point has been stored in firebase yet, then a new one is fetched from the noaa API and
 * stored before being returned.

 * @param {Object} comparisonPoint - the comparison point for which to fetch the noaa point.
 * @returns {Object}
 * @returns {NOAAPoint} .noaaPoint - the NOAAPoint object
 * @returns {Object} .comparisonPoint - a new comparison point object updated with the noaaPoint.
 */
export async function fetchNOAAPointForComparisonPoint(comparisonPoint) {
  if (comparisonPoint.noaaPointId) {
    const noaaPointSnapshot = await db
      .ref(NOAAPoint.getFirebasePath(comparisonPoint.noaaPointId))
      .once('value');
    const data = noaaPointSnapshot.val();
    if (data) {
      return {noaaPoint: new NOAAPoint({data}), comparisonPoint};
    }
  }
  // either firebase is missing the data, or we don't even have a noaa point id, in which case
  // we need to fetch from the noaa api.
  const {latitude, longitude} = comparisonPoint;
  const noaaPoint = await NOAAPoint.fetch({latitude, longitude});
  await db.ref(noaaPoint.getFirebasePath()).set(noaaPoint.data);
  comparisonPoint = {
    ...comparisonPoint,
    noaaPointId: noaaPoint.getFirebaseId(),
  };
  await db
    .ref(`comparisonPoints/${comparisonPoint.id}/noaaPointId`)
    .set(comparisonPoint.noaaPointId);
  return {
    noaaPoint,
    comparisonPoint,
  };
}

async function fetchRelativeDayGridForecast(gridForecast, delta = 0) {
  const currentDay = moment(
    new Date(gridForecast.data.properties.updateTime)
  ).endOf('day');
  const yesterday =
    delta < 0
      ? currentDay.subtract(-delta, 'days')
      : currentDay.add(delta, 'days');
  const snapshot = await db
    .ref(NOAAGridDataForecast.getFirebasePath(gridForecast.getFirebaseId()))
    .orderByKey()
    .endAt(yesterday.format('YYYY-MM-DD'))
    .limitToLast(1)
    .once('value');
  const values = snapshot.val();
  if (values) {
    return new NOAAGridDataForecast({data: Object.values(values)[0]});
  }
  return null;
}

export async function updateNOAAPoint(noaaPoint) {
  const gridForecast = await noaaPoint.fetchGridDataForecast();
  await db.ref(gridForecast.getFirebasePath()).set(gridForecast.data);
  console.log('Updated grid forecast', gridForecast.getFirebasePath());

  const dailyForecast = await noaaPoint.fetchDailyForecast();
  await db.ref(dailyForecast.getFirebasePath()).set(dailyForecast.data);
  console.log('Updated daily forecast', dailyForecast.getFirebasePath());

  const alertsForecast = await noaaPoint.fetchAlertsForecast();
  await db.ref(alertsForecast.getFirebasePath()).set(alertsForecast.alertIds);
  const alerts = alertsForecast.getAlerts();
  for (const alert of alerts) {
    await db.ref(alert.getFirebasePath()).set(alert.data);
  }
  console.log('Updated alerts forecast', alertsForecast.getFirebasePath());

  // fetch previous 3 days of grid forecasts.
  // get last 3 grid forecasts that were stored
  const allGridForecasts = await Promise.all([
    fetchRelativeDayGridForecast(gridForecast, -3),
    fetchRelativeDayGridForecast(gridForecast, -2),
    fetchRelativeDayGridForecast(gridForecast, -1),
  ]);
  allGridForecasts.push(gridForecast);
  const fullProps = {};
  const includeProps = [
    'temperature',
    'windSpeed',
    'probabilityOfPrecipitation',
    'quantitativePrecipitation',
  ];
  includeProps.forEach(prop => {
    fullProps[prop] = {};
  });
  allGridForecasts.forEach(gf => {
    includeProps.forEach(prop => {
      gf.data.properties[prop].values.forEach(value => {
        fullProps[prop][value.validTime] = value.value;
      });
    });
  });
  const threeDayProps = {};
  includeProps.forEach(prop => {
    threeDayProps[prop] = [];
    const validTimes = Object.keys(fullProps[prop]);
    validTimes.sort();
    validTimes.forEach(validTime => {
      threeDayProps[prop].push({
        validTime,
        value: fullProps[prop][validTime],
      });
    });
  });
  const rollup = {
    id: gridForecast.data.id,
    properties: {
      ...threeDayProps,
      gridId: gridForecast.data.properties.gridId,
      gridX: gridForecast.data.properties.gridX,
      gridY: gridForecast.data.properties.gridY,
      updateTime: gridForecast.data.properties.updateTime,
    },
  };
  await db.ref(`noaaPointRollups/${noaaPoint.getFirebaseId()}`).set(rollup);
  console.log(
    'Updated rollup',
    `noaaPointRollups/${noaaPoint.getFirebaseId()}`
  );
}

export async function updateComparisonPointForecasts(comparisonPoint) {
  console.log('Updating comparison point', comparisonPoint.id);
  const {noaaPoint} = await fetchNOAAPointForComparisonPoint(comparisonPoint);
  await updateNOAAPoint(noaaPoint);
}
