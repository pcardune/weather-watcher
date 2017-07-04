import {combineReducers} from 'redux-immutable';

import globalReducer from 'containers/App/reducer';

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(asyncReducers) {
  return combineReducers({
    global: globalReducer,
    ...asyncReducers,
  });
}
