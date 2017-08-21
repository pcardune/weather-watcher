import {takeEvery} from 'redux-saga/effects';
import firebase from 'app/firebaseApp';

import {CREATE_COMPARISON} from './constants';

export function* watchCreateComparison() {
  yield takeEvery(CREATE_COMPARISON, function* createComparison({name}) {
    const containerRef = firebase.database().ref('/comparisons');
    const id = containerRef.push().key;
    containerRef.child(id).set({id, name, comparisonPointIds: {}});
  });
}

export default [watchCreateComparison];
