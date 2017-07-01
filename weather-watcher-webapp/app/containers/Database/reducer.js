/*
 *
 * Database reducer
 *
 */

import {fromJS, OrderedMap} from 'immutable';
import {
  FETCH_NOAA_POINT,
  RECEIVE_NOAA_POINT,
  FETCH_NOAA_FORECAST,
  RECEIVE_NOAA_FORECAST,
  CREATE_COMPARISON_POINT,
  UPDATE_COMPARISON_POINT,
  CREATE_COMPARISON,
  UPDATE_COMPARISON,
} from './constants';

export const initialState = fromJS({
  fetches: OrderedMap(),
  noaaPoints: OrderedMap(),
  noaaGridForecasts: OrderedMap(),
  noaaDailyForecasts: OrderedMap(),
  noaaHourlyForecasts: OrderedMap(),
  comparisonPoints: OrderedMap(),
  comparisons: OrderedMap(),
});

function databaseReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_NOAA_POINT:
      return state.setIn(
        ['fetches', `noaaPoint-${action.latitude},${action.longitude}`],
        true
      );
    case FETCH_NOAA_FORECAST:
      return state.setIn(['fetches', action.forecastId], true);
    case RECEIVE_NOAA_POINT:
      return state
        .setIn(['noaaPoints', action.noaaPoint.id], action.noaaPoint)
        .deleteIn([
          'fetches',
          `noaaPoint-${action.latitude},${action.longitude}`,
        ]);
    case RECEIVE_NOAA_FORECAST: {
      const key = {
        hourly: 'noaaHourlyForecasts',
        daily: 'noaaDailyForecasts',
        grid: 'noaaGridForecasts',
      }[action.forecastType];
      return state
        .setIn(
          [
            key,
            action.forecastId,
            action.forecast.properties.updateTime ||
              action.forecast.properties.updated,
          ],
          action.forecast
        )
        .deleteIn(['fetches', action.forecastId]);
    }
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
