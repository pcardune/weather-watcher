import React, {Component, PropTypes} from 'react';
import moment from 'moment-mini';
import {AugmentedComparisonShape} from 'app/propTypes';
import SingleDayForecastComparison from './SingleDayForecastComparison';

export default class MultiDayForecastComparison extends Component {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
  };

  render() {
    const {comparison} = this.props;
    const tables = [];
    for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
      const date = moment(new Date()).add(dayOffset, 'days').toDate();
      tables.push(
        <SingleDayForecastComparison
          key={date.toString()}
          comparison={comparison}
          date={date}
          onRemoveComparisonPoint={this.props.onRemoveComparisonPoint}
        />
      );
    }
    return (
      <div>
        <h1>{comparison.name}</h1>
        {tables}
      </div>
    );
  }
}
