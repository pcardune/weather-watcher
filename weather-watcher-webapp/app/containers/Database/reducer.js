/*
 *
 * Database reducer
 *
 */

import {Map} from 'immutable';

export const initialState = Map(
  process.env.IS_SERVER ? {} : window.REDUX_INITIAL_STATE.database
);

function databaseReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default databaseReducer;
