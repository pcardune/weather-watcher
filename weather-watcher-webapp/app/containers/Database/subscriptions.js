import memoize from 'lodash.memoize';
import fromPairs from 'lodash.frompairs';
import {
  Subscription,
  getFirebaseMirror,
  hasReceivedValueSelector,
} from 'redux-firebase-mirror';
import {List, Map} from 'immutable';
import {createSelector} from 'reselect';

import {InterpolatedGridForecast, InterpolatedScoreFunction} from './scoring';
import {selectScoreConfig} from './selectors';

// TODO fix build issue with this being in cloud functions
export function coordinateArrayToFirebaseKey(coordinates) {
  return coordinates.join('|').replace(/\./g, ',');
}

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
  const selector = createSelector([getFirebaseMirror], mirror =>
    mirror.get(key, defaultValue)
  );
  selector.path = key;
  return selector;
}

function createItemSelector(parentSelector) {
  return createSelector(
    [parentSelector, hasReceivedValueSelector],
    (parent, hasReceivedValue) =>
      memoize(id => {
        const item = parent.get(id);
        return {
          value: item && item.toJS(),
          isLoading: !hasReceivedValue([parentSelector.path, id].join('/')),
        };
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
  List(
    BUILTIN_COMPARISON_IDS.map(id => getComparison(id).value).filter(c => !!c)
  )
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
  ],
  (
    getComparisonPoint,
    getNoaaPoint,
    getNoaaDailyForecast,
    getNoaaGridForecast
  ) =>
    memoize(comparisonPointId => {
      const comparisonPointFuture = getComparisonPoint(comparisonPointId);
      const {value: comparisonPoint} = comparisonPointFuture;
      if (comparisonPoint) {
        const {noaaPointId} = comparisonPoint;
        if (noaaPointId) {
          const noaaPoint = getNoaaPoint(noaaPointId).value;
          if (noaaPoint) {
            const {
              value: daily,
              isLoading: isDailyLoading,
            } = getNoaaDailyForecast(getForecastId(noaaPoint));
            const {value: grid, isLoading: isGridLoading} = getNoaaGridForecast(
              getGridForecastId(noaaPoint)
            );
            return {
              ...comparisonPoint,
              isLoadingForecast: isDailyLoading || isGridLoading,
              isLoading: isDailyLoading || isGridLoading,
              noaaPoint,
              noaaDailyForecast: getLatest(daily),
              noaaGridForecast: getLatest(grid),
            };
          }
        }
      }
      return {...comparisonPoint, isLoading: true};
    })
);

const getAugmentedComparisonGetter = createSelector(
  [Items.comparisons, getAugmentedComparisonPointGetter, selectScoreConfig],
  (getComparison, getAugmentedComparisonPoint, scoreConfig) =>
    memoize(comparisonId => {
      const {value: comparison, isLoading} = getComparison(comparisonId);
      if (comparison) {
        return {
          ...comparison,
          scoreConfig,
          comparisonPoints: Object.values(
            comparison.comparisonPointIds
          ).map(comparisonPointId => {
            let comparisonPoint = getAugmentedComparisonPoint(
              comparisonPointId
            );
            if (comparisonPoint && comparisonPoint.noaaGridForecast) {
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
            return {id: comparisonPointId, ...comparisonPoint};
          }),
        };
      }
      return {id: comparisonId, isLoading};
    })
);

export const comparisonById = new Subscription({
  paths: (state, {comparisonId}) => [`/comparisons/${comparisonId}`],
  value: (state, {comparisonId}) =>
    Items.comparisons(state)(comparisonId).value,
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
    `/comparisonPoints/${comparisonPointId}`,
  ],
  value: (state, {comparisonPointId}) =>
    Items.comparisonPoints(state)(comparisonPointId).value,
});

export const noaaPointById = new Subscription({
  paths: (state, {noaaPointId}) => [`/noaaPoints/${noaaPointId}`],
  value: (state, {noaaPointId}) => Items.noaaPoints(state)(noaaPointId).value,
});

export const augmentedComparisonPointById = new Subscription({
  paths: (state, {comparisonPointId}) => {
    let paths = comparisonPointById.paths(state, {comparisonPointId});
    const {value: comparisonPoint} = Items.comparisonPoints(state)(
      comparisonPointId
    );
    if (comparisonPoint) {
      const {noaaPointId} = comparisonPoint;
      if (noaaPointId) {
        paths = paths.concat(noaaPointById.paths(state, {noaaPointId}));
        const {value: noaaPoint} = Items.noaaPoints(state)(noaaPointId);
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
    const {value: comparison} = Items.comparisons(state)(comparisonId);
    if (comparison) {
      Object.values(
        comparison.comparisonPointIds
      ).forEach(comparisonPointId => {
        paths = paths.concat(
          augmentedComparisonPointById.paths(state, {comparisonPointId})
        );
      });
    }
    return paths;
  },
  value: (state, {comparisonId}) =>
    getAugmentedComparisonGetter(state)(comparisonId),
});
