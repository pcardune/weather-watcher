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
    ],
    (comparisons, comparisonPoints, noaaPoints, noaaGridForecasts) =>
      comparisonId => {
        const comparison = comparisons.get(comparisonId);
        return comparison && {
          ...comparison,
          comparisonPoints: comparison.comparisonPointIds.map(pointId => {
            const point = comparisonPoints.get(pointId);
            return {
              ...point,
              noaaPoint: noaaPoints.get(point.noaaPointId),
              noaaGridForecast: noaaGridForecasts
                .get(point.noaaGridForecastId, OrderedMap())
                .valueSeq()
                .get(-1),
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
  nums.forEach(n => {
    s += n;
  });
  return s / nums.length;
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

export function getScoreForDate(augmentedComparisonPoint, date) {
  if (!augmentedComparisonPoint.noaaGridForecast) {
    return {score: 0};
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
  };
}
