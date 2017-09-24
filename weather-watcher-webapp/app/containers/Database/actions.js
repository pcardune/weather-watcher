import {PromiseCallback} from 'app/utils/promise';

import {
  CREATE_COMPARISON,
  ADD_COMPARISON_POINT,
  REMOVE_COMPARISON_POINT,
} from './constants';

export function createComparison({id, name}) {
  return {
    type: CREATE_COMPARISON,
    id,
    name,
    promise: new PromiseCallback(),
  };
}

export function addComparisonPoint({
  id,
  name,
  position: {lat, lng},
  placeId,
  comparisonId,
}) {
  return {
    type: ADD_COMPARISON_POINT,
    id,
    name,
    latitude: lat,
    longitude: lng,
    placeId,
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
