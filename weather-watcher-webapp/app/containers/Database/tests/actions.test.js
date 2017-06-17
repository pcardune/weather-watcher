import {fetchNOAAPoint} from '../actions';
import {FETCH_NOAA_POINT} from '../constants';

describe('Database actions', () => {
  describe('fetchNOAAPoint', () => {
    it('has a type of FETCH_NOAA_POINT', () => {
      const latitude = 122.3452;
      const longitude = 45.1431;
      expect(fetchNOAAPoint({latitude, longitude})).toEqual({
        type: FETCH_NOAA_POINT,
        latitude,
        longitude,
      });
    });
  });
});
