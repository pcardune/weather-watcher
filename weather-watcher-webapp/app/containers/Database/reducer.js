import {fromJS} from 'immutable';

import {LOGIN_USER} from './constants';
import {LOGOUT_USER} from './constants';

const initialState = fromJS({});

export default function databaseReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_USER: {
      const {uid, isAnonymous} = action.user;
      return state.set('user', fromJS({uid, isAnonymous}));
    }
    case LOGOUT_USER:
      return state.delete('user');
  }
  return state;
}
