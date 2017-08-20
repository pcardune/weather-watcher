import {combineReducers} from 'redux-immutable';
import reduxFirebaseMirror from 'redux-firebase-mirror';

import firebaseApp from 'app/firebaseApp';
import globalReducer from 'app/containers/App/reducer';
const firebaseMirror = reduxFirebaseMirror({
  getFirebase: () => firebaseApp,
  getFirebaseState: state => state.get('firebaseMirror'),
  persistToLocalStorage: process.env.IS_SERVER
    ? null
    : {
        storage: localStorage,
        storagePrefix: 'weather:',
      },
});

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(asyncReducers) {
  return combineReducers({
    firebaseMirror,
    global: globalReducer,
    ...asyncReducers,
  });
}
