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

export const ADD_COMPARISON_POINT = 'weather-watcher/Home/ADD_COMPARISON_POINT';
export const REMOVE_COMPARISON_POINT =
  'weather-watcher/Home/REMOVE_COMPARISON_POINT';
export const FORECAST_BAD = 60;
export const FORECAST_OK = 85;
