import memoize from 'lodash.memoize';
import fromPairs from 'lodash.frompairs';
import {
  Subscription,
  getFirebaseMirror,
  hasReceivedValueSelector,
  getValueAtPath,
} from 'redux-firebase-mirror';
import {List, Map} from 'immutable';
import {createSelector} from 'reselect';

import firebase from 'app/firebaseApp';
import firebaseStorageAPI from 'app/firebaseStorageAPI';

import {InterpolatedGridForecast, InterpolatedScoreFunction} from './scoring';

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

export const getDatabaseDomain = state => state.get('database');

export const getUser = createSelector([getDatabaseDomain], databaseDomain =>
  databaseDomain.get('user')
);

export const getUserId = createSelector(
  [getUser],
  user => (user ? user.get('uid') : null)
);

const SelectorConfig = {
  comparisons: {
    transformValue: comparison => {
      if (comparison) {
        comparison.comparisonPointIds = comparison.comparisonPointIds || {};
      }
      return comparison;
    },
  },
  comparisonPoints: {},
  noaaPoints: {},
  noaaGridForecasts: {},
  noaaDailyForecasts: {},
  noaaAlerts: {},
  noaaAlertsForecasts: {
    transformValue: Object.values,
  },
};

function createRootSelector(key, defaultValue = Map()) {
  const selector = createSelector([getFirebaseMirror], mirror =>
    mirror.get(key, defaultValue)
  );
  selector.path = key;
  return selector;
}

function createItemSelector(key, parentSelector) {
  const config = SelectorConfig[key];
  const dependencies = [parentSelector, hasReceivedValueSelector];
  if (process.env.IS_SERVER) {
    dependencies.push(getFirebaseMirror);
  }
  return createSelector(dependencies, (parent, hasReceivedValue, mirror) =>
    memoize(id => {
      const path = [parentSelector.path, id].join('/');
      const item = process.env.IS_SERVER
        ? firebaseStorageAPI.getValueAtPath(mirror, path)
        : parent.get(id);
      // TODO: hasReceivedValue doesn't work with complex Path Specs...
      const isLoading = !hasReceivedValue(path);
      let value = item;
      if (item) {
        value = item.toJS();
        if (config.transformValue) {
          value = config.transformValue(value);
        }
      }
      return {
        value,
        isLoading,
      };
    })
  );
}

const Root = fromPairs(
  Object.keys(SelectorConfig).map(key => [key, createRootSelector(key)])
);

const Items = fromPairs(
  Object.keys(Root).map(key => [key, createItemSelector(key, Root[key])])
);

const getMyComparisons = createSelector([Root.comparisons], comparisons =>
  List(comparisons.valueSeq().toJS().filter(c => !!c))
);

export function getGridForecastId(noaaPoint) {
  return [
    noaaPoint.properties.cwa,
    noaaPoint.properties.gridX,
    noaaPoint.properties.gridY,
  ].join('|');
}

export function getForecastId(noaaPoint) {
  return coordinateArrayToFirebaseKey(noaaPoint.geometry.coordinates);
}

export function getForecastZoneId(noaaPoint) {
  return noaaPoint.properties.forecastZone.split('/').slice(-1)[0];
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
    Items.noaaAlertsForecasts,
    Items.noaaAlerts,
  ],
  (
    getComparisonPoint,
    getNoaaPoint,
    getNoaaDailyForecast,
    getNoaaGridForecast,
    getNoaaAlertsForecast,
    getNoaaAlert
  ) =>
    memoize((comparisonPointId, scoreConfig) => {
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
            const noaaDailyForecast = getLatest(daily);
            const {value: grid, isLoading: isGridLoading} = getNoaaGridForecast(
              getGridForecastId(noaaPoint)
            );
            const noaaGridForecast = getLatest(grid);
            const {value: alertIds} = getNoaaAlertsForecast(
              getForecastZoneId(noaaPoint)
            );
            const alerts = (alertIds || []).map(id => getNoaaAlert(id).value);
            const isLoading = !noaaGridForecast || !noaaDailyForecast;
            return {
              ...comparisonPoint,
              isLoadingForecast: isLoading,
              isLoading,
              noaaPoint,
              noaaDailyForecast,
              noaaGridForecast,
              alerts,
              interpolatedScore: new InterpolatedScoreFunction({
                interpolatedGridForecast: new InterpolatedGridForecast(
                  noaaGridForecast
                ),
                scoreConfig,
              }),
            };
          }
        }
      }
      return {...comparisonPoint, id: comparisonPointId, isLoading: true};
    }, (comparisonId, scoreConfig) => comparisonId + JSON.stringify(scoreConfig))
);

const getAugmentedComparisonGetter = createSelector(
  [Items.comparisons, getAugmentedComparisonPointGetter],
  (getComparison, getAugmentedComparisonPoint) =>
    memoize((comparisonId, scoreConfig) => {
      const {value: comparison, isLoading} = getComparison(comparisonId);
      if (comparison) {
        let comparisonPoints = [];
        if (comparison.comparisonPointIds) {
          comparisonPoints = Object.values(
            comparison.comparisonPointIds
          ).map(comparisonPointId => {
            const comparisonPoint = getAugmentedComparisonPoint(
              comparisonPointId,
              scoreConfig
            );
            return {id: comparisonPointId, ...comparisonPoint};
          });
        }
        return {
          ...comparison,
          scoreConfig,
          comparisonPoints,
        };
      }
      return {id: comparisonId, isLoading};
    }, (comparisonId, scoreConfig) => comparisonId + JSON.stringify(scoreConfig))
);

export const comparisonById = new Subscription({
  paths: (state, {comparisonId}) => [`/comparisons/${comparisonId}`],
  value: (state, {comparisonId}) =>
    Items.comparisons(state)(comparisonId).value,
});

export const myComparisons = new Subscription({
  paths: state => {
    const paths = [
      ...flatten(
        BUILTIN_COMPARISON_IDS.map(comparisonId =>
          comparisonById.paths(state, {comparisonId})
        )
      ),
      {
        path: '/comparisons',
        orderByChild: 'creator',
        filter: {equalTo: getUserId(state)},
      },
    ];
    return paths;
  },
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
            `/noaaAlertsForecasts/${getForecastZoneId(noaaPoint)}`,
          ]);

          const {value: alertIds} = Items.noaaAlertsForecasts(state)(
            getForecastZoneId(noaaPoint)
          );
          if (alertIds) {
            paths = paths.concat(
              alertIds.map(alertId => `/noaaAlerts/${alertId}`)
            );
          }
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
      if (comparison.comparisonPointIds) {
        Object.values(
          comparison.comparisonPointIds
        ).forEach(comparisonPointId => {
          paths = paths.concat(
            augmentedComparisonPointById.paths(state, {comparisonPointId})
          );
        });
      }
    }
    return paths;
  },
  value: (state, {comparisonId, scoreConfig}) =>
    getAugmentedComparisonGetter(state)(comparisonId, scoreConfig),
});
