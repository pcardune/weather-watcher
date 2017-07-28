/*
 *
 * Database reducer
 *
 */

import {Map} from 'immutable';
import {UPDATE_SCORE_CONFIG} from './constants';

export const initialState = Map({
  scoreConfig: {
    idealTemp: 65,
    coldDeduction: 1,
    hotDeduction: 1,
    windDeduction: 1,
    rainDeduction: 0.01,
    rainRiskDeduction: 2,
    tempRange: [32, 45, 65, 75, 85],
    windRange: [0, 0, 0, 5, 20],
    precipRange: [0, 0, 0, 20, 50],
    quantityRange: [0, 0, 0, 0.03, 0.1],
  },
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
