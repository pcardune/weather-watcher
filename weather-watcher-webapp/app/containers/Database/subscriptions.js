import memoize from 'lodash.memoize';
import fromPairs from 'lodash.frompairs';
import {
  Subscription,
  getValueAtPath,
  getFirebaseMirror,
} from 'redux-firebase-mirror';
import {List, Map} from 'immutable';
import {coordinateArrayToFirebaseKey} from 'weather-watcher-cloud-functions/src/noaa';
import {createSelector} from 'reselect';
import {InterpolatedGridForecast, InterpolatedScoreFunction} from './scoring';

const BUILTIN_COMPARISON_IDS = [
  'wa-climb-crags',
  'wa-climb-mountains',
  'wa-climb-passes',
];

function flatten(a) {
  let b = [];
  a.forEach(i => {
    if (Array.isArray(i)) {
      b = b.concat(flatten(i));
    } else {
      b.push(i);
    }
  });
  return b;
}

function createRootSelector(key, defaultValue = Map()) {
  return createSelector([getFirebaseMirror], mirror =>
    mirror.get(key, defaultValue)
  );
}

function createItemSelector(parentSelector) {
  return createSelector([parentSelector], parent =>
    memoize(id => {
      const item = parent.get(id);
      return item && item.toJS();
    })
  );
}

const Root = fromPairs(
  [
    'comparisons',
    'comparisonPoints',
    'noaaPoints',
    'noaaGridForecasts',
    'noaaDailyForecasts',
    'noaaHourlyForecasts',
  ].map(key => [key, createRootSelector(key)])
);

const Items = fromPairs(
  Object.keys(Root).map(key => [key, createItemSelector(Root[key])])
);

const getMyComparisons = createSelector([Items.comparisons], getComparison =>
  List(BUILTIN_COMPARISON_IDS.map(getComparison).filter(c => !!c))
);

function getGridForecastId(noaaPoint) {
  return [
    noaaPoint.properties.cwa,
    noaaPoint.properties.gridX,
    noaaPoint.properties.gridY,
  ].join('|');
}

function getForecastId(noaaPoint) {
  return coordinateArrayToFirebaseKey(noaaPoint.geometry.coordinates);
}

function getLatest(dateKeyedObject) {
  if (!dateKeyedObject) {
    return undefined;
  }
  const keys = Object.keys(dateKeyedObject);
  if (!keys.length) {
    return undefined;
  }
  keys.sort();
  const lastKey = keys[keys.length - 1];
  return dateKeyedObject[lastKey];
}

const getAugmentedComparisonPointGetter = createSelector(
  [
    Items.comparisonPoints,
    Items.noaaPoints,
    Items.noaaDailyForecasts,
    Items.noaaGridForecasts,
    Items.noaaHourlyForecasts,
  ],
  (
    getComparisonPoint,
    getNoaaPoint,
    getNoaaDailyForecast,
    getNoaaGridForecast,
    getNoaaHourlyForecast
  ) =>
    memoize(comparisonPointId => {
      let comparisonPoint = getComparisonPoint(comparisonPointId);
      if (comparisonPoint) {
        const {noaaPointId} = comparisonPoint;
        if (noaaPointId) {
          const noaaPoint = getNoaaPoint(noaaPointId);
          if (noaaPoint) {
            const daily = getNoaaDailyForecast(getForecastId(noaaPoint));
            const grid = getNoaaGridForecast(getGridForecastId(noaaPoint));
            const hourly = getNoaaHourlyForecast(getForecastId(noaaPoint));
            comparisonPoint = {
              ...comparisonPoint,
              noaaPoint,
              noaaDailyForecast: getLatest(daily),
              noaaHourlyForecast: getLatest(hourly),
              noaaGridForecast: getLatest(grid),
            };
          }
        }
      }
      return comparisonPoint;
    })
);

const getAugmentedComparisonGetter = createSelector(
  [Items.comparisons, getAugmentedComparisonPointGetter],
  (getComparison, getAugmentedComparisonPoint) =>
    memoize(comparisonId => {
      let comparison = getComparison(comparisonId);
      if (comparison) {
        const scoreConfig = comparison.scoreConfig || {
          idealTemp: 18.5,
        };
        comparison = {
          ...comparison,
          scoreConfig,
          comparisonPoints: comparison.comparisonPointIds
            .map(comparisonPointId => {
              let comparisonPoint = getAugmentedComparisonPoint(
                comparisonPointId
              );
              if (comparisonPoint) {
                const {noaaGridForecast} = comparisonPoint;
                comparisonPoint = {
                  ...comparisonPoint,
                  interpolatedScore: new InterpolatedScoreFunction({
                    interpolatedGridForecast: new InterpolatedGridForecast(
                      noaaGridForecast
                    ),
                    scoreConfig,
                  }),
                };
              }
              return comparisonPoint;
            })
            .filter(cp => !!cp),
        };
      }
      return comparison;
    })
);

export const comparisonById = new Subscription({
  paths: (state, {comparisonId}) => [`/comparisons/${comparisonId}`],
  value: (state, {comparisonId}) => Items.comparisons(state)(comparisonId),
});

export const myComparisons = new Subscription({
  paths: state =>
    flatten(
      BUILTIN_COMPARISON_IDS.map(comparisonId =>
        comparisonById.paths(state, {comparisonId})
      )
    ),
  value: getMyComparisons,
});

export const comparisonPointById = new Subscription({
  paths: (state, {comparisonPointId}) => [
    {path: `/comparisonPoints/${comparisonPointId}`},
  ],
  value: (state, {comparisonPointId}) =>
    Items.comparisonPoints(state)(comparisonPointId),
});

export const noaaPointById = new Subscription({
  paths: (state, {noaaPointId}) => [`/noaaPoints/${noaaPointId}`],
  value: (state, {noaaPointId}) => Items.noaaPoints(state)(noaaPointId),
});

export const augmentedComparisonPointById = new Subscription({
  paths: (state, {comparisonPointId}) => {
    let paths = comparisonPointById.paths(state, {comparisonPointId});
    const comparisonPoint = Items.comparisonPoints(state)(comparisonPointId);
    if (comparisonPoint) {
      const {noaaPointId} = comparisonPoint;
      if (noaaPointId) {
        paths = paths.concat(noaaPointById.paths(state, {noaaPointId}));
        const noaaPoint = Items.noaaPoints(state)(noaaPointId);
        if (noaaPoint) {
          const filter = {limitToLast: 1};
          paths = paths.concat([
            {path: `/noaaDailyForecasts/${getForecastId(noaaPoint)}`, filter},
            {
              path: `/noaaGridForecasts/${getGridForecastId(noaaPoint)}`,
              filter,
            },
            {
              path: `/noaaHourlyForecasts/${getForecastId(noaaPoint)}`,
              filter,
            },
          ]);
        }
      }
    }
    return paths;
  },
  value: (state, {comparisonPointId}) =>
    getAugmentedComparisonPointGetter(state)(comparisonPointId),
});

export const augmentedComparisonById = new Subscription({
  paths: (state, {comparisonId}) => {
    let paths = comparisonById.paths(state, {comparisonId});
    const comparison = comparisonById.value(state, {comparisonId});
    if (comparison) {
      comparison.comparisonPointIds.forEach(comparisonPointId => {
        paths = paths.concat(
          augmentedComparisonPointById.paths(state, {comparisonPointId})
        );
      });
    }
    return paths;
  },
  value: (state, {comparisonId}) => {
    return getAugmentedComparisonGetter(state)(comparisonId);
  },
});
