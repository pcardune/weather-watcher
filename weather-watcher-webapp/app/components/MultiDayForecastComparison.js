import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {AugmentedComparisonShape} from 'app/propTypes';
import SingleDayForecastComparison from './SingleDayForecastComparison';
// import ComparisonGraph from './ComparisonGraph';
import DatePager from './DatePager';

export default class MultiDayForecastComparison extends PureComponent {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    date: PropTypes.instanceOf(Date),
    onChangeDate: PropTypes.func.isRequired,
  };

  static defaultProps = {
    date: new Date(),
  };

  state = {
    selectedPointId: null,
  };

  onSelectComparisonPoint = pointId => {
    if (this.state.selectedPointId === pointId) {
      this.setState({selectedPointId: null});
    } else {
      this.setState({selectedPointId: pointId});
    }
  };

  render() {
    return (
      <div>
        <DatePager
          onChange={this.props.onChangeDate}
          currentDate={this.props.date}
        />
        <SingleDayForecastComparison
          key={this.props.date.toString()}
          comparison={this.props.comparison}
          date={this.props.date}
          onRemoveComparisonPoint={this.props.onRemoveComparisonPoint}
          onSelectComparisonPoint={this.onSelectComparisonPoint}
          selectedComparisonPointId={this.state.selectedPointId}
        />
        {/*
            This graph was deemed too confusing to be useful
            <ComparisonGraph
            comparison={this.props.comparison}
            date={this.props.date}
            onClickDate={this.props.onClickDate}
            highlightPointId={this.state.selectedPointId}
            />
          */}
      </div>
    );
  }
}
