import moment from 'moment-mini';

import {NUM_FORECAST_DAYS} from 'app/constants';

/**
 * Returns the number of milliseconds between now and the end of the day.
 * Useful for scheduling things that need to change on a page that has
 * been open for multiple days.
 */
export function getMillisecondsTillDateTransition() {
  return (
    moment(new Date()).endOf('day').toDate().getTime() - new Date().getTime()
  );
}

let dates = null;
/**
 * Returns dates for the forecasted days in the future.
 */
export function getForecastDates() {
  if (!dates) {
    setTimeout(() => {
      dates = null;
    }, getMillisecondsTillDateTransition());
    dates = [];
    for (let dayOffset = 0; dayOffset < NUM_FORECAST_DAYS; dayOffset++) {
      dates.push(
        moment(new Date()).startOf('date').add(dayOffset, 'days').toDate()
      );
    }
  }
  return dates;
}
