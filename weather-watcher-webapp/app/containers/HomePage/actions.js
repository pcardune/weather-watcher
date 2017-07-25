import {ADD_COMPARISON_POINT, REMOVE_COMPARISON_POINT} from './constants';

export function addComparisonPoint({name, position: {lat, lng}, comparisonId}) {
  return {
    type: ADD_COMPARISON_POINT,
    name,
    latitude: lat,
    longitude: lng,
    comparisonId,
  };
}

export function removeComparisonPoint(comparison, comparisonPointId) {
  return {
    type: REMOVE_COMPARISON_POINT,
    comparison,
    comparisonPointId,
  };
}
