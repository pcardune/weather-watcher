import moment from 'moment-mini';

import {NUM_FORECAST_DAYS_AHEAD, NUM_FORECAST_DAYS_BACK} from 'app/constants';

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

function getMinForecastDate() {
  const now = new Date();
  let minDate = moment(now).startOf('hour').hour(12 + 8).toDate(); // today at 8pm
  if (minDate.getTime() < now.getTime()) {
    // it's after 8pm, minDate should be yesterday
    minDate = moment(minDate)
      .startOf('day')
      .add(-NUM_FORECAST_DAYS_BACK + 1, 'days')
      .toDate();
  } else {
    // it's before 8pm, minDate should be two days ago
    minDate = moment(minDate)
      .startOf('day')
      .add(-NUM_FORECAST_DAYS_BACK, 'days')
      .toDate();
  }
  return minDate;
}

export function clampDateToForecastDates(date) {
  const minDate = getMinForecastDate();
  const maxDate = moment(minDate)
    .startOf('date')
    .add(NUM_FORECAST_DAYS_BACK + NUM_FORECAST_DAYS_AHEAD - 1, 'days')
    .toDate();

  if (minDate.getTime() > date.getTime()) {
    return minDate;
  } else if (maxDate.getTime() < date.getTime()) {
    return maxDate;
  }
  return date;
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
    const minDate = getMinForecastDate();
    dates = [minDate];
    for (
      let dayOffset = 1;
      dayOffset < NUM_FORECAST_DAYS_AHEAD + NUM_FORECAST_DAYS_BACK;
      dayOffset++
    ) {
      dates.push(
        moment(minDate).startOf('date').add(dayOffset, 'days').toDate()
      );
    }
  }
  return dates;
}
