/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import {call, put, takeEvery} from 'redux-saga/effects';
import {NOAAClient} from 'app/noaa';
import {watchFetchNOAAPoint, doFetchNOAAPoint} from '../sagas';
import {receiveNOAAPoint} from '../actions';
import {FETCH_NOAA_POINT} from '../constants';
import sampleNOAAPoint from './sampleNOAAPoint.json';
// const generator = defaultSaga();

describe('doFetchNOAAPoint saga', () => {
  const saga = doFetchNOAAPoint({latitude: 123, longitude: 123});
  it('should call NOAAClient.fetchNOAAPoint', () => {
    expect(saga.next().value).toEqual(
      call(NOAAClient.fetchNOAAPoint, {latitude: 123, longitude: 123})
    );
  });

  it('should put receiveNOAAPoint when fetchNOAAPoint returns', () => {
    expect(saga.next(sampleNOAAPoint).value).toEqual(
      put(receiveNOAAPoint({noaaPoint: sampleNOAAPoint}))
    );
  });
});

describe('watchFetchNOAAPoint saga', () => {
  const saga = watchFetchNOAAPoint();

  it('should watch for FETCH_NOAA_POINT action', () => {
    expect(saga.next().value).toEqual(
      takeEvery(FETCH_NOAA_POINT, doFetchNOAAPoint)
    );
  });
});
