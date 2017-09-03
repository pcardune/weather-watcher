import {takeEvery} from 'redux-saga/effects';
import firebase from 'app/firebaseApp';

import {ADD_COMPARISON_POINT, REMOVE_COMPARISON_POINT} from './constants';

export function* watchAddComparisonPoint() {
  yield takeEvery(ADD_COMPARISON_POINT, function* createAndShowComparisonPoint({
    id,
    name,
    latitude,
    longitude,
    comparisonId,
    promise,
  }) {
    id = id || firebase.database().ref('comparisonPoints').push().key;
    firebase
      .database()
      .ref(`comparisonPoints/${id}`)
      .update({id, name, latitude, longitude})
      .then(promise.resolve)
      .catch(promise.reject);
    if (comparisonId) {
      firebase
        .database()
        .ref(`comparisons/${comparisonId}/comparisonPointIds/${id}`)
        .set(id);
    }
  });
}

export function* watchRemoveComparisonPoint() {
  yield takeEvery(REMOVE_COMPARISON_POINT, function* removeComparisonPoint({
    comparison,
    comparisonPointId,
  }) {
    firebase
      .database()
      .ref(
        `comparisons/${comparison.id}/comparisonPointIds/${comparisonPointId}`
      )
      .remove();
  });
}

export default [watchAddComparisonPoint, watchRemoveComparisonPoint];
