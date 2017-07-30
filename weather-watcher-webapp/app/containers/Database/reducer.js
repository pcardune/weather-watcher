/*
 *
 * Database reducer
 *
 */

import {Map} from 'immutable';
import {UPDATE_SCORE_CONFIG, DEFAULT_SCORE_CONFIG} from './constants';

export const initialState = Map({
  scoreConfig: DEFAULT_SCORE_CONFIG,
});

function databaseReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SCORE_CONFIG:
      return state.set('scoreConfig', action.scoreConfig);
    default:
      return state;
  }
}

export default databaseReducer;
