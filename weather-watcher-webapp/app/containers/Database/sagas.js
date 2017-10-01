import {takeEvery, call} from 'redux-saga/effects';
import firebase from 'app/firebaseApp';

import {
  CREATE_COMPARISON,
  ADD_COMPARISON_POINT,
  REMOVE_COMPARISON_POINT,
} from './constants';

export function* watchCreateComparison() {
  yield takeEvery(CREATE_COMPARISON, function* createComparison({
    id,
    name,
    promise,
  }) {
    let user = firebase.auth().currentUser;
    if (!user) {
      const auth = firebase.auth();
      user = yield call([auth, auth.signInAnonymously]);
    }
    id = id || firebase.database().ref('comparisons').push().key;
    firebase
      .database()
      .ref(`comparisons/${id}`)
      .update({
        id,
        name,
        creator: user.uid,
        createdOn: firebase.database.ServerValue.TIMESTAMP,
        comparisonPointIds: {},
      })
      .then(promise.resolve)
      .catch(promise.reject);
  });
}

export function* watchAddComparisonPoint() {
  yield takeEvery(ADD_COMPARISON_POINT, function* createAndShowComparisonPoint({
    id,
    name,
    latitude,
    longitude,
    placeId,
    comparisonId,
    promise,
  }) {
    id = id || firebase.database().ref('comparisonPoints').push().key;
    firebase
      .database()
      .ref(`comparisonPoints/${id}`)
      .update({id, name, latitude, longitude, placeId})
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

export default [
  watchCreateComparison,
  watchAddComparisonPoint,
  watchRemoveComparisonPoint,
];
