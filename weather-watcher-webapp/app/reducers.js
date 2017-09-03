import {combineReducers} from 'redux-immutable';
import reduxFirebaseMirror from 'redux-firebase-mirror';

import firebaseApp from 'app/firebaseApp';
import globalReducer from 'app/containers/App/reducer';
import firebaseStorageAPI from 'app/firebaseStorageAPI';

const firebaseMirror = reduxFirebaseMirror({
  getFirebase: () => firebaseApp,
  getFirebaseState: state => state.get('firebaseMirror'),
  persistToLocalStorage: process.env.IS_SERVER
    ? null
    : {
        storage: localStorage,
        storagePrefix: 'weather:',
      },
  storageAPI: firebaseStorageAPI,
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
