/*
 *
 * Database actions
 *
 */

import uuid from 'uuid';
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

export function fetchNOAAPoint({latitude, longitude}) {
  return {
    type: FETCH_NOAA_POINT,
    latitude,
    longitude,
  };
}

export function receiveNOAAPoint({noaaPoint}) {
  return {
    type: RECEIVE_NOAA_POINT,
    noaaPoint,
  };
}

export function fetchNOAAForecast({forecastId, forecastType, noaaPoint}) {
  if (!forecastId) {
    const key = {
      daily: 'forecast',
      hourly: 'forecastHourly',
      grid: 'forecastGridData',
    }[forecastType];
    forecastId = noaaPoint.properties[key];
  }
  return {
    type: FETCH_NOAA_FORECAST,
    forecastId,
    forecastType,
  };
}

export function receiveNOAAForecast({forecastId, forecastType, forecast}) {
  return {
    type: RECEIVE_NOAA_FORECAST,
    forecastType,
    forecast,
    forecastId,
  };
}

export function createComparisonPoint({name, latitude, longitude}) {
  return {
    type: CREATE_COMPARISON_POINT,
    comparisonPoint: {id: uuid.v4(), name, latitude, longitude},
  };
}

export function updateComparisonPoint(comparisonPoint) {
  return {
    type: UPDATE_COMPARISON_POINT,
    comparisonPoint,
  };
}

export function createComparison({name}) {
  return {
    type: CREATE_COMPARISON,
    comparison: {
      id: uuid.v4(),
      name,
      comparisonPointIds: [],
    },
  };
}

export function updateComparison(comparison) {
  return {
    type: UPDATE_COMPARISON,
    comparison,
  };
}
