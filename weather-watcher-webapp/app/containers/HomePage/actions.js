import {ADD_COMPARISON_POINT, REMOVE_COMPARISON_POINT} from './constants';
import {PromiseCallback} from 'app/utils/promise';

export function addComparisonPoint({
  id,
  name,
  position: {lat, lng},
  comparisonId,
}) {
  return {
    type: ADD_COMPARISON_POINT,
    id,
    name,
    latitude: lat,
    longitude: lng,
    comparisonId,
    promise: new PromiseCallback(),
  };
}

export function removeComparisonPoint(comparison, comparisonPointId) {
  return {
    type: REMOVE_COMPARISON_POINT,
    comparison,
    comparisonPointId,
  };
}
