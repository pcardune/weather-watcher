import databaseReducer, {initialState} from '../reducer';
import {
  receiveNOAAPoint,
} from '../actions';
import sampleNOAAPoint from './sampleNOAAPoint.json';

describe('databaseReducer', () => {
  it('returns the initial state', () => {
    expect(databaseReducer(undefined, {})).toEqual(initialState);
  });

  it('receives noaa points', () => {
    const noaaPoint = sampleNOAAPoint;
    const state = databaseReducer(
      undefined,
      receiveNOAAPoint({
        noaaPoint,
      })
    );
    expect(state.get('noaaPoints').valueSeq()).toContain(noaaPoint);
    expect(state.getIn(['noaaPoints', noaaPoint.id])).toEqual(noaaPoint);
  });
});
