import {combineReducers} from 'redux-immutable';
import reduxFirebaseMirror from 'redux-firebase-mirror';

import globalReducer from 'containers/App/reducer';
const firebaseMirror = reduxFirebaseMirror();

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
