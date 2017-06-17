/*
 * HomeReducer
 *
 * The reducer takes care of our data. Using actions, we can change our
 * application state.
 * To add a new action, add it to the switch statement in the reducer function
 *
 * Example:
 * case YOUR_ACTION_CONSTANT:
 *   return state.set('yourStateVariable', true);
 */
import {fromJS} from 'immutable';

import {SHOW_COMPARISON} from './constants';

const initialState = fromJS({
  comparisonId: null,
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_COMPARISON:
      return state.set('comparisonId', action.comparisonId);
    default:
      return state;
  }
}

export default homeReducer;
