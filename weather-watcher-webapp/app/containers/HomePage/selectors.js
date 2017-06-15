/**
 * Homepage selectors
 */

import {createSelector} from 'reselect';

export const selectHome = state => state.get('home');

export const makeSelectUsername = () =>
  createSelector(selectHome, homeState => homeState.get('username'));

export const selectComparison = createSelector(selectHome, home =>
  home.get('comparison'));
