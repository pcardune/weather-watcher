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
import {REHYDRATE} from 'redux-persist/constants';

import {
  createComparison,
  createComparisonPoint,
  updateComparison,
  refreshComparisonPoint,
} from 'app/containers/Database/actions';
import {selectComparisonIds} from 'app/containers/Database/selectors';
import {selectComparisonToShow} from './selectors';

import {
  ADD_COMPARISON_POINT,
  RESET_COMPARISON,
  REFRESH_COMPARISON,
} from './constants';
import {showComparison, refreshComparison} from './actions';

export function* watchResetComparison() {
  yield take(RESET_COMPARISON);
  yield put(createComparison({name: 'Untitled Comparison'}));
  const ids = yield select(selectComparisonIds());
  yield put(showComparison(ids.get(-1)));
}

export function* watchAddComparisonPoint() {
  yield takeEvery(ADD_COMPARISON_POINT, function* createAndShowComparisonPoint({
    name,
    latitude,
    longitude,
  }) {
    const createAction = createComparisonPoint({name, latitude, longitude});
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
  });
}

export function* watchRefreshComparison() {
  yield takeLatest(REFRESH_COMPARISON, function*() {
    const comparison = yield select(selectComparisonToShow());
    for (const comparisonPointId of comparison.comparisonPointIds) {
      yield put(refreshComparisonPoint(comparisonPointId));
    }
  });
}

export function* watchRehydrate() {
  yield takeLatest(REHYDRATE, function*() {
    yield put(refreshComparison());
  });
}

export default [
  watchResetComparison,
  watchRefreshComparison,
  watchAddComparisonPoint,
  watchRehydrate,
];
