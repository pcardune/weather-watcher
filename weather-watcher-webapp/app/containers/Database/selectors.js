import {OrderedMap} from 'immutable';
import {createSelector} from 'reselect';
import moment from 'moment-mini';
import {safeAverage, safeMin, safeMax} from 'app/utils/math';

import {InterpolatedGridForecast, InterpolatedScoreFunction} from './scoring';

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
            interpolatedScore: new InterpolatedScoreFunction({
              interpolatedGridForecast: new InterpolatedGridForecast(
                noaaGridForecast
              ),
            }),
          };
        }),
      };
    }
);

export function getAverageScoreForDate(augmentedComparisonPoint, date) {
  const scores = augmentedComparisonPoint.interpolatedScore.getScoresForDate(
    date
  );

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
