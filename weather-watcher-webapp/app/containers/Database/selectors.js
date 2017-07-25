/**
 * Direct selector to the database state domain
 */
export const selectDatabaseDomain = () => state => state.get('database');
