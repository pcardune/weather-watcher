import {OrderedMap} from 'immutable';
import {createSelector} from 'reselect';
import moment from 'moment-mini';
import {safeAverage, safeMin, safeMax} from 'app/utils/math';
import convert from 'convert-units';

import {InterpolatedGridForecast} from './scoring';

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

export const selectNOAAGridForecasts = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('noaaGridForecasts'));

export const selectNOAADailyForecasts = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('noaaDailyForecasts'));

export const selectNOAAHourlyForecasts = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('noaaHourlyForecasts'));

export const selectComparisonPoints = () =>
  createSelector(selectDatabaseDomain(), database =>
    database.get('comparisonPoints'));

export const selectComparisons = () =>
  createSelector(selectDatabaseDomain(), db => db.get('comparisons'));

export const selectFetches = () =>
  createSelector(selectDatabaseDomain(), db => db.get('fetches'));

export const makeSelectAugmentedComparison = createSelector(
  [
    selectComparisons(),
    selectComparisonPoints(),
    selectNOAAPoints(),
    selectNOAAGridForecasts(),
    selectNOAADailyForecasts(),
    selectNOAAHourlyForecasts(),
    selectFetches(),
  ],
  (comparisons, comparisonPoints, noaaPoints, noaaGridForecasts, noaaDailyForecasts, noaaHourlyForecasts, fetches) =>
    comparisonId => {
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
          const isRefreshing = (noaaGridForecast &&
            fetches.get(noaaGridForecast.id)) ||
            (noaaHourlyForecast && fetches.get(noaaHourlyForecast.id)) ||
            (noaaDailyForecast && fetches.get(noaaDailyForecast.id)) ||
            (noaaPoint && fetches.get(noaaPoint.id));
          return {
            ...point,
            isRefreshing,
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
  TEMP: -1,
};

function filterNOAAValuesByDate(values, date) {
  const filtered = values
    .filter(value =>
      moment(new Date(value.validTime.split('/')[0])).isSame(date, 'day'))
    .map(v => v.value);
  return filtered;
}

function getAverageNOAAValueForDate(property, date) {
  const avg = safeAverage(filterNOAAValuesByDate(property.values, date));
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
    const windSpeed = grid.getValue('windSpeed', t);
    const precipQuantity = grid.getValue('quantitativePrecipitation', t);
    const temp = grid.getValue('temperature', t);
    const score = 100 +
      Math.round(
        WEIGHTS.PRECIPITATION_QUANTITY * precipQuantity +
          WEIGHTS.PRECIPITATION_PERCENT * precip +
          WEIGHTS.WIND_SPEED * windSpeed +
          WEIGHTS.TEMP * Math.abs(temp - 18.3)
      );
    scores.push({
      score,
      probabilityOfPrecipitation: precip,
      quantitativePrecipitation: precipQuantity,
      windSpeed,
      temperature: temp,
      time: t,
    });
  }
  return scores;
}

export function getScoreForDate(augmentedComparisonPoint, date) {
  const scores = getScoresForDate(augmentedComparisonPoint, date);

  if (!scores.length) {
    return {
      score: 0,
    };
  }

  const dailyForecast = {
    day: {},
    night: {},
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

  return {
    score: safeAverage(scores.map(s => s.score)),
    probabilityOfPrecipitation: safeAverage(
      scores.map(s => s.probabilityOfPrecipitation)
    ),
    quantitativePrecipitation: safeAverage(
      scores.map(s => s.quantitativePrecipitation)
    ),
    windSpeed: safeAverage(scores.map(s => s.windSpeed)),
    maxTemp: safeMax(scores.map(s => s.temperature)),
    minTemp: safeMin(scores.map(s => s.temperature)),
    dailyForecast,
  };
}
