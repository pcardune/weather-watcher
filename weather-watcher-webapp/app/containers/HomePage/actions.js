/*
 * Home Actions
 *
 * Actions change things in your application
 * Since this boilerplate uses a uni-directional data flow, specifically redux,
 * we have these actions which are the only way your application interacts with
 * your application state. This guarantees that your state is up to date and nobody
 * messes it up weirdly somewhere.
 *
 * To add a new Action:
 * 1) Import your constant
 * 2) Add a function like this:
 *    export function yourAction(var) {
 *        return { type: YOUR_ACTION_CONSTANT, var: var }
 *    }
 */

import {updateComparison} from 'app/containers/Database/actions';

import {
  REFRESH_COMPARISON,
  RECEIVE_COMPARISON,
  ADD_COMPARISON_POINT,
  RESET_COMPARISON,
  SHOW_COMPARISON,
} from './constants';

export function resetComparison() {
  return {type: RESET_COMPARISON};
}

export function showComparison(comparisonId) {
  return {type: SHOW_COMPARISON, comparisonId};
}

export function refreshComparison(comparison) {
  return {type: REFRESH_COMPARISON, comparison};
}

export function receiveComparison(comparison) {
  return {type: RECEIVE_COMPARISON, comparison};
}

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
  return updateComparison({
    id: comparison.id,
    comparisonPointIds: comparison.comparisonPointIds.filter(
      id => id !== comparisonPointId
    ),
  });
}
