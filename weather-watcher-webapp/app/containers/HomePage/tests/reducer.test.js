import {fromJS} from 'immutable';

import homeReducer from '../reducer';
import {receiveComparison} from '../actions';
import {Comparison} from 'weather-watcher-core';

describe('homeReducer', () => {
  let state;
  beforeEach(() => {
    state = fromJS({
      comparison: null,
    });
  });

  it('should return the initial state', () => {
    const expectedResult = state;
    expect(homeReducer(undefined, {})).toEqual(expectedResult);
  });

  it('should handle the receiveComparison action correctly', () => {
    const comparison = new Comparison({});
    const expectedResult = state.set('comparison', comparison);

    expect(homeReducer(state, receiveComparison(comparison))).toEqual(
      expectedResult
    );
  });
});
