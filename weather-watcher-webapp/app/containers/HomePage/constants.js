/*
 * HomeConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */

export const CHANGE_USERNAME = 'boilerplate/Home/CHANGE_USERNAME';
export const REFRESH_COMPARISON = 'weather-watcher/Home/REFRESH_COMPARISON';
export const RECEIVE_COMPARISON = 'weather-watcher/Home/RECEIVE_COMPARISON';
export const DEFAULT_COMPARISON_DATA = {
  name: 'climbing',
  pointsToCompare: [
    {
      name: 'Seattle',
      latitude: 47.6062,
      longitude: -122.3321,
    },
    {
      name: 'Vantage',
      latitude: 46.9502,
      longitude: -119.9534,
    },
    {
      name: 'Tieton',
      latitude: 46.7021,
      longitude: -120.7553,
    },
    {
      name: 'Index',
      latitude: 47.8207,
      longitude: -121.5551,
    },
    {
      name: 'Mt. Erie',
      latitude: 48.4537,
      longitude: -122.6254,
    },
    {
      name: 'Mt. Baker',
      latitude: 48.7586,
      longitude: -121.8283,
    },
  ],
};
