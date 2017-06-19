import {OrderedMap} from 'immutable';
import {createSelector} from 'reselect';
import moment from 'moment-mini';

/**
 * Direct selector to the database state domain
 */
export const selectDatabaseDomain = () => state => state.get('database');

/**
 * Other specific selectors
 */

/**
 * Default selector used by Database
 */

export const selectNOAAPoints = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('noaaPoints'));

export const selectNOAAPoint = id =>
  createSelector(selectNOAAPoints(), points => points.get(id));

export const selectNOAAGridForecasts = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('noaaGridForecasts'));

export const selectNOAADailyForecasts = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('noaaDailyForecasts'));

export const selectNOAAHourlyForecasts = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('noaaHourlyForecasts'));

export const selectNOAAGridForecast = id =>
  createSelector(selectNOAAGridForecasts, forecasts =>
    forecasts.get(id).valueSeq().get(-1));

export const selectComparisonPoints = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('comparisonPoints'));

export const selectComparisonPoint = id =>
  createSelector(selectComparisonPoints(), points => points.get(id));

export const selectComparisons = () =>
  createSelector(selectDatabaseDomain(), db => db.get('comparisons'));
export const selectComparisonIds = () =>
  createSelector(selectComparisons(), comparisons => comparisons.keySeq());

export const makeSelectAugmentedComparison = () =>
  createSelector(
    [
      selectComparisons(),
      selectComparisonPoints(),
      selectNOAAPoints(),
      selectNOAAGridForecasts(),
      selectNOAADailyForecasts(),
      selectNOAAHourlyForecasts(),
    ],
    (comparisons, comparisonPoints, noaaPoints, noaaGridForecasts, noaaDailyForecasts, noaaHourlyForecasts) =>
      comparisonId => {
        console.log('calculating augmented comparison');
        const comparison = comparisons.get(comparisonId);
        return comparison && {
          ...comparison,
          comparisonPoints: comparison.comparisonPointIds.map(pointId => {
            const point = comparisonPoints.get(pointId);
            const noaaPoint = noaaPoints.get(point.noaaPointId);
            const noaaGridForecast = noaaPoint &&
              noaaGridForecasts
                .get(noaaPoint.properties.forecastGridData, OrderedMap())
                .valueSeq()
                .get(-1);
            const noaaHourlyForecast = noaaPoint &&
              noaaHourlyForecasts
                .get(noaaPoint.properties.forecastHourly, OrderedMap())
                .valueSeq()
                .get(-1);
            const noaaDailyForecast = noaaPoint &&
              noaaDailyForecasts
                .get(noaaPoint.properties.forecast, OrderedMap())
                .valueSeq()
                .get(-1);
            return {
              ...point,
              noaaPoint,
              noaaGridForecast,
              noaaHourlyForecast,
              noaaDailyForecast,
              interpolatedGrid: noaaGridForecast &&
                new InterpolatedGridForecast(noaaGridForecast),
            };
          }),
        };
      }
  );

const WEIGHTS = {
  WIND_SPEED: -1,
  PRECIPITATION_PERCENT: -0.5,
  PRECIPITATION_QUANTITY: -1,
};

function filterNOAAValuesByDate(values, date) {
  const filtered = values
    .filter(value =>
      moment(new Date(value.validTime.split('/')[0])).isSame(date, 'day'))
    .map(v => v.value);
  return filtered;
}

function average(nums) {
  let s = 0;
  let count = 0;
  nums.forEach(n => {
    if (!isNaN(s)) {
      s += n;
      count++;
    }
  });
  if (count === 0) {
    return 0;
  }
  return s / count;
}

function getAverageNOAAValueForDate(property, date) {
  const avg = average(filterNOAAValuesByDate(property.values, date));
  return avg;
}

export function getSortedPointsForDate(augmentedComparison, date) {
  const sorted = [...augmentedComparison.comparisonPoints];
  sorted.sort(
    (p1, p2) =>
      getScoreForDate(p2, date).score - getScoreForDate(p1, date).score
  );
  return sorted;
}

class InterpolatedGridForecast {
  constructor(noaaGridForecast) {
    this.noaaGridForecast = noaaGridForecast;
    this.interpolators = {};
  }

  getValue(propName, time) {
    const values = this.noaaGridForecast.properties[propName].values;
    if (values.length === 0) {
      return null;
    }
    let interpolator = this.interpolators[propName];
    if (!interpolator) {
      const filledValues = {};
      for (let i = 0; i < values.length; i++) {
        const {value, validTime} = values[i];
        const [startTimeStr, durationStr] = validTime.split('/');
        const currentTime = moment(new Date(startTimeStr)).startOf('hour');
        const duration = moment.duration(durationStr);
        for (let j = 0; j < duration.as('hours'); j++) {
          filledValues[
            moment(currentTime).add(j, 'hours').toISOString()
          ] = value;
        }
      }

      this.interpolators[propName] = {
        values: filledValues,
        start: new Date(values[0].validTime.split('/')[0]).getTime(),
        end: new Date(
          values[values.length - 1].validTime.split('/')[0]
        ).getTime(),
        inRange(aTime) {
          return this.start <= aTime && this.end >= aTime;
        },
        getValue(aTime) {
          if (this.inRange(aTime)) {
            const key = moment(new Date(aTime)).startOf('hour').toISOString();
            return this.values[key];
          }
          return null;
        },
      };
      interpolator = this.interpolators[propName];
    }
    return interpolator.getValue(time);
  }
}

export function getScoresForDate(
  augmentedComparisonPoint,
  date,
  interval = 'PT1H'
) {
  const scores = [];
  if (!augmentedComparisonPoint.noaaGridForecast) {
    return scores;
  }

  const grid = augmentedComparisonPoint.interpolatedGrid;
  const startTime = moment(date).startOf('date');
  const endTime = moment(date).endOf('date');
  const duration = moment.duration(interval);
  for (
    let t = startTime.valueOf();
    t < endTime.valueOf();
    t = moment(t).add(duration).valueOf()
  ) {
    const precip = grid.getValue('probabilityOfPrecipitation', t);
    if (precip === undefined) {
      debugger;
      grid.getValue('probabilityOfPrecipitation', t);
    }
    const windSpeed = grid.getValue('windSpeed', t);
    const precipQuantity = grid.getValue('quantitativePrecipitation', t);
    const score = 100 +
      Math.round(
        WEIGHTS.PRECIPITATION_QUANTITY * precipQuantity +
          WEIGHTS.PRECIPITATION_PERCENT * precip +
          WEIGHTS.WIND_SPEED * windSpeed
      );
    //console.log({
    //  score,
    //  probabilityOfPrecipitation: precip,
    //  quantitativePrecipitation: precipQuantity,
    //  windSpeed,
    //  time: t,
    //});
    scores.push({
      score,
      probabilityOfPrecipitation: precip,
      quantitativePrecipitation: precipQuantity,
      windSpeed,
      time: t,
    });
  }
  return scores;
}

export function getScoreForDate(augmentedComparisonPoint, date) {
  if (!augmentedComparisonPoint.noaaGridForecast) {
    return {
      score: 0,
    };
  }
  const props = augmentedComparisonPoint.noaaGridForecast.properties;
  const precipAvg = getAverageNOAAValueForDate(
    props.probabilityOfPrecipitation,
    date
  );
  const windSpeedAvg = getAverageNOAAValueForDate(props.windSpeed, date);
  const precipQuantityAvg = getAverageNOAAValueForDate(
    props.quantitativePrecipitation,
    date
  );

  const dailyForecast = {
    day: null,
    night: null,
  };
  if (augmentedComparisonPoint.noaaDailyForecast) {
    augmentedComparisonPoint.noaaDailyForecast.properties.periods.forEach(
      period => {
        if (moment(new Date(period.startTime)).isSame(date, 'day')) {
          if (period.isDaytime) {
            dailyForecast.day = period;
          } else {
            dailyForecast.night = period;
          }
        }
      }
    );
  }

  const score = (isNaN(precipQuantityAvg)
    ? 0
    : WEIGHTS.PRECIPITATION_QUANTITY * precipQuantityAvg) +
    WEIGHTS.PRECIPITATION_PERCENT * precipAvg +
    WEIGHTS.WIND_SPEED * windSpeedAvg;
  return {
    score: 100 + Math.round(score),
    probabilityOfPrecipitation: precipAvg,
    windSpeed: windSpeedAvg,
    quantitativePrecipitation: precipQuantityAvg,
    dailyForecast,
  };
}
