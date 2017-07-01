import React, {PureComponent, PropTypes} from 'react';
import {AugmentedComparisonShape} from 'app/propTypes';
import SingleDayForecastComparison from './SingleDayForecastComparison';
import ComparisonGraph from './ComparisonGraph';

export default class MultiDayForecastComparison extends PureComponent {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    date: PropTypes.instanceOf(Date),
    onClickDate: PropTypes.func.isRequired,
  };

  static defaultProps = {
    date: new Date(),
  };

  render() {
    return (
      <div>
        <SingleDayForecastComparison
          key={this.props.date.toString()}
          comparison={this.props.comparison}
          date={this.props.date}
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
