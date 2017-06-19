import React, {Component, PropTypes} from 'react';
import {AugmentedComparisonShape} from 'app/propTypes';
import SingleDayForecastComparison from './SingleDayForecastComparison';
import ComparisonGraph from './ComparisonGraph';

export default class MultiDayForecastComparison extends Component {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    date: PropTypes.instanceOf(Date),
    onClickDate: PropTypes.func.isRequired,
  };

  render() {
    const date = this.props.date || new Date();
    return (
      <div>
        <SingleDayForecastComparison
          key={date.toString()}
          comparison={this.props.comparison}
          date={date}
          onRemoveComparisonPoint={this.props.onRemoveComparisonPoint}
        />
        <ComparisonGraph
          comparison={this.props.comparison}
          date={this.props.date}
          onClickDate={this.props.onClickDate}
        />
      </div>
    );
  }
}
