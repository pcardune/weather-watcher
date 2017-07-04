import {takeLatest, put, select, takeEvery} from 'redux-saga/effects';

import {
  createComparisonPoint,
  updateComparison,
  refreshComparisonPoint,
} from 'app/containers/Database/actions';
import {selectComparisons} from 'app/containers/Database/selectors';

import {ADD_COMPARISON_POINT, REFRESH_COMPARISON} from './constants';

export function* watchAddComparisonPoint() {
  yield takeEvery(ADD_COMPARISON_POINT, function* createAndShowComparisonPoint({
    name,
    latitude,
    longitude,
    comparisonId,
  }) {
    const createAction = createComparisonPoint({name, latitude, longitude});
    yield put(createAction);
    const comparisons = yield select(selectComparisons());
    const comparison = comparisons.get(comparisonId);
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
  yield takeLatest(REFRESH_COMPARISON, function*({comparison}) {
    for (const comparisonPointId of comparison.comparisonPointIds) {
      yield put(refreshComparisonPoint(comparisonPointId));
    }
  });
}
export default [watchRefreshComparison, watchAddComparisonPoint];
