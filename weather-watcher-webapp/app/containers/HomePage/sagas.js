/**
 * Gets the repositories of the user from Github
 */

import {
  fork,
  take,
  takeLatest,
  put,
  select,
  takeEvery,
} from 'redux-saga/effects';
import moment from 'moment-mini';

import {
  createComparison,
  createComparisonPoint,
  updateComparison,
  fetchNOAAGridForecast,
} from 'app/containers/Database/actions';
import {
  selectComparisonIds,
  selectComparisonPoints,
  selectNOAAGridForecasts,
} from 'app/containers/Database/selectors';

import {selectComparisonToShow} from './selectors';

import {
  ADD_COMPARISON_POINT,
  RESET_COMPARISON,
  REFRESH_COMPARISON,
} from './constants';
import {showComparison} from './actions';

export function* watchResetComparison() {
  yield take(RESET_COMPARISON);
  yield put(createComparison({name: 'Untitled Comparison'}));
  const ids = yield select(selectComparisonIds());
  yield put(showComparison(ids.get(-1)));
}

export function* createAndShowComparisonPoint({comparisonPoint}) {
  const createAction = createComparisonPoint(comparisonPoint);
  yield put(createAction);
  const comparison = yield select(selectComparisonToShow());
  yield put(
    updateComparison({
      ...comparison,
      comparisonPointIds: [
        ...comparison.comparisonPointIds,
        createAction.comparisonPoint.id,
      ],
    })
  );
}

export function* watchAddComparisonPoint() {
  yield takeEvery(ADD_COMPARISON_POINT, createAndShowComparisonPoint);
}

export function* refreshComparisonPoint(comparisonPointId) {
  const allPoints = yield select(selectComparisonPoints());
  const comparisonPoint = allPoints.get(comparisonPointId);
  if (!comparisonPoint) {
    return;
  }
  if (comparisonPoint.noaaGridForecastId) {
    const allGridForecasts = yield select(selectNOAAGridForecasts());
    const gridForecast = allGridForecasts.get(
      comparisonPoint.noaaGridForecastId
    );
    const lastGridForecastUpdate = new Date(gridForecast.keySeq().get(-1));
    if (
      moment(lastGridForecastUpdate).isBefore(
        moment(new Date()).subtract(12, 'hours')
      )
    ) {
      yield put(
        fetchNOAAGridForecast({
          noaaPoint: {
            properties: {forecastGridData: comparisonPoint.noaaGridForecastId},
          },
        })
      );
    }
  }
}

export function* watchRefreshComparison() {
  yield takeLatest(REFRESH_COMPARISON, function*() {
    const comparison = yield select(selectComparisonToShow());
    for (const comparisonPointId of comparison.comparisonPointIds) {
      yield fork(refreshComparisonPoint, comparisonPointId);
    }
  });
}

export default [
  watchResetComparison,
  watchRefreshComparison,
  watchAddComparisonPoint,
];
