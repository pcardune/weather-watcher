/**
 * Homepage selectors
 */

import {createSelector} from 'reselect';
import {makeSelectAugmentedComparison} from 'app/containers/Database/selectors';

export const selectHome = () => state => state.get('home');

export const selectAugmentedComparisonToShow = comparisonId =>
  createSelector([makeSelectAugmentedComparison()], selectAugmentedComparison =>
    selectAugmentedComparison(comparisonId));
