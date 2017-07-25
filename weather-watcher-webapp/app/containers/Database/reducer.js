/*
 *
 * Database reducer
 *
 */

import {fromJS} from 'immutable';

export const initialState = fromJS({});

function databaseReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default databaseReducer;
