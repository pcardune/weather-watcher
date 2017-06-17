/**
 * Gets the repositories of the user from Github
 */

import {take, put, select, takeEvery} from 'redux-saga/effects';
import {
  createComparison,
  createComparisonPoint,
  updateComparison,
} from 'app/containers/Database/actions';
import {selectComparisonIds} from 'app/containers/Database/selectors';

import {selectComparisonToShow} from './selectors';

import {ADD_COMPARISON_POINT, RESET_COMPARISON} from './constants';
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

export default [watchResetComparison, watchAddComparisonPoint];
