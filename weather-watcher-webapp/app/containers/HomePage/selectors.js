/**
 * Homepage selectors
 */

import {createSelector} from 'reselect';
import {
  selectComparisons,
  makeSelectAugmentedComparison,
} from 'app/containers/Database/selectors';

export const selectHome = () => state => state.get('home');

export const selectComparisonId = () =>
  createSelector(selectHome(), home => home.get('comparisonId'));

export const selectComparisonToShow = () =>
  createSelector(
    [selectComparisonId(), selectComparisons()],
    (comparisonId, comparisons) => comparisons.get(comparisonId)
  );

export const selectAugmentedComparisonToShow = () =>
  createSelector(
    [selectComparisonId(), makeSelectAugmentedComparison()],
    (comparisonId, selectAugmentedComparison) =>
      selectAugmentedComparison(comparisonId)
  );
