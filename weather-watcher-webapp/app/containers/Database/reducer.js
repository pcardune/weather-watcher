/*
 *
 * Database reducer
 *
 */

import {Map} from 'immutable';

export const initialState = Map({});

function databaseReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default databaseReducer;
