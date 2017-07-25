import databaseReducer, {initialState} from '../reducer';
import {receiveNOAAPoint} from '../actions';
import sampleNOAAPoint from './sampleNOAAPoint.json';

describe('databaseReducer', () => {
  it('returns the initial state', () => {
    expect(databaseReducer(undefined, {})).toEqual(initialState);
  });
});
