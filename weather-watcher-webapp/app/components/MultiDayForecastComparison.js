import React from 'react';
import moment from 'moment-mini';
import {Comparison} from 'weather-watcher-core';
import SingleDayForecastComparison from './SingleDayForecastComparison';

export default function MultiDayForecastComparison({comparison}) {
  const tables = [];
  for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
    const date = moment(new Date()).add(dayOffset, 'days').toDate();
    tables.push(
      <SingleDayForecastComparison
        key={date.toString()}
        {...{comparison, date}}
      />
    );
  }
  return <div>{tables}</div>;
}

MultiDayForecastComparison.propTypes = {
  comparison: React.PropTypes.instanceOf(Comparison),
};
