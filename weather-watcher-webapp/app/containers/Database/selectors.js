import {createSelector} from 'reselect';

export const selectDatabaseDomain = state => state.get('database');
