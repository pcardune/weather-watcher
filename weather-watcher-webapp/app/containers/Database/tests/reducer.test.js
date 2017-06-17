import {fromJS, Map} from 'immutable';
import databaseReducer, {initialState} from '../reducer';
import {
  receiveNOAAPoint,
  receiveNOAAGridForecast,
  createPointToCompare,
  updatePointToCompare,
  createComparison,
  updateComparison,
} from '../actions';
import {selectComparisonIds, selectComparison} from '../selectors';
import sampleNOAAPoint from './sampleNOAAPoint.json';
import sampleNOAAGridForecast from './sampleNOAAGridForecast';

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

  it('receives noaa grid forecasts', () => {
    const noaaGridForecast = sampleNOAAGridForecast;
    const state = databaseReducer(
      undefined,
      receiveNOAAGridForecast({noaaGridForecast})
    );
    expect(state.get('noaaGridForecasts').keySeq()).toContain(
      noaaGridForecast.id
    );
    expect(
      state.getIn(['noaaGridForecasts', noaaGridForecast.id]).keySeq()
    ).toContain(noaaGridForecast.properties.updateTime);
    expect(
      state.getIn([
        'noaaGridForecasts',
        noaaGridForecast.id,
        noaaGridForecast.properties.updateTime,
      ])
    ).toEqual(noaaGridForecast);
  });

  it('creates points to compare', () => {
    const pointToCompare = {
      name: 'Index',
      latitude: 47.8207,
      longitude: -121.5551,
    };
    const state = databaseReducer(
      undefined,
      createPointToCompare(pointToCompare)
    );
    expect(state.get('pointsToCompare').valueSeq().get(0)).toEqual(
      pointToCompare
    );
  });

  it('creates comparisons', () => {
    const comparison = {
      name: 'Climbing',
    };
    const state = Map({
      database: databaseReducer(undefined, createComparison(comparison)),
    });
    const ids = selectComparisonIds()(state);
    expect(ids.size).toEqual(1);
    expect(selectComparison(ids.get(0))(state)).toEqual(comparison);
  });
});
