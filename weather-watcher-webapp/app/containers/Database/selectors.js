import {createSelector} from 'reselect';

export const selectDatabaseDomain = state => state.get('database');

export const selectScoreConfig = createSelector([selectDatabaseDomain], db =>
  db.get('scoreConfig')
);
