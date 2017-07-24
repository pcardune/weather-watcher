import {
  UPDATE_COMPARISON_POINT,
  CREATE_COMPARISON,
  UPDATE_COMPARISON,
} from './constants';

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
      name,
    },
  };
}

export function updateComparison(comparison) {
  return {
    type: UPDATE_COMPARISON,
    comparison,
  };
}
