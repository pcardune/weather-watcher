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
import {fromJS, Map} from 'immutable';

import Comparison from 'app/models/Comparison';
import {RECEIVE_COMPARISON, ADD_POINT_TO_COMPARE} from './constants';

// The initial state of the App
const initialState = fromJS({
  comparison: new Comparison(),
  allPointsToCompare: Map(),
});

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_COMPARISON:
      return state.set('comparison', action.comparison);
    case ADD_POINT_TO_COMPARE:
      console.log('heyo, updating state');
      return state.merge({
        comparison: state
          .get('comparison')
          .addPointToCompare(action.pointToCompare),
      });
    default:
      return state;
  }
}

export default homeReducer;
