/*
 *
 * Database reducer
 *
 */

import {fromJS, OrderedMap} from 'immutable';
import {
  FETCH_NOAA_POINT,
  RECEIVE_NOAA_POINT,
  FETCH_NOAA_GRID_FORECAST,
  RECEIVE_NOAA_GRID_FORECAST,
  CREATE_COMPARISON_POINT,
  UPDATE_COMPARISON_POINT,
  CREATE_COMPARISON,
  UPDATE_COMPARISON,
} from './constants';

export const initialState = fromJS({
  noaaPoints: OrderedMap(),
  noaaGridForecasts: OrderedMap(),
  comparisonPoints: OrderedMap(),
  comparisons: OrderedMap(),
});

function databaseReducer(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_NOAA_POINT:
      return state.setIn(['noaaPoints', action.noaaPoint.id], action.noaaPoint);
    case RECEIVE_NOAA_GRID_FORECAST:
      return state.setIn(
        [
          'noaaGridForecasts',
          action.noaaGridForecast.id,
          action.noaaGridForecast.properties.updateTime,
        ],
        action.noaaGridForecast
      );
    case UPDATE_COMPARISON_POINT:
      return state.updateIn(
        ['comparisonPoints', action.comparisonPoint.id],
        point => ({...point, ...action.comparisonPoint})
      );
    case CREATE_COMPARISON_POINT:
      return state.setIn(
        ['comparisonPoints', action.comparisonPoint.id],
        action.comparisonPoint
      );
    case UPDATE_COMPARISON:
      return state.updateIn(
        ['comparisons', action.comparison.id],
        comparison => ({...comparison, ...action.comparison})
      );
    case CREATE_COMPARISON:
      return state.setIn(
        ['comparisons', action.comparison.id],
        action.comparison
      );
    default:
      return state;
  }
}

export default databaseReducer;
