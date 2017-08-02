import styled from 'styled-components';
import React, {PureComponent, PropTypes} from 'react';

import ForecastTableHeader from 'app/components/ForecastTableHeader';
import {
  DesktopForecastRow,
  PhoneForecastRow,
  LoadingRow,
} from 'app/components/ForecastRow';
import {AugmentedComparisonShape} from 'app/propTypes';

const ComparisonTable = styled.table`width: 100%;`;

function makeSortFunc(date) {
  return (p1, p2) => {
    if (p1.isLoading || p2.isLoading) {
      return p1.isLoading ? 1 : -1;
    }
    return (
      p2.interpolatedScore.getAverageScoreForDate(date).score -
      p1.interpolatedScore.getAverageScoreForDate(date).score
    );
  };
}

export default class SingleDayForecastComparison extends PureComponent {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    onSelectComparisonPoint: PropTypes.func.isRequired,
    selectedComparisonPointId: PropTypes.string,
  };

  static defaultProps = {
    selectedComparisonPointId: null,
  };

  onClickRow = point => {
    this.props.onSelectComparisonPoint(point.id);
  };

  render() {
    const {comparison, date} = this.props;
    const sorted = [...comparison.comparisonPoints];
    sorted.sort(makeSortFunc(date));
    return (
      <ComparisonTable>
        <ForecastTableHeader />
        <tbody>
          {[].concat(
            ...sorted.map(
              point =>
                point.isLoading || point.isLoadingForecast
                  ? <LoadingRow key={`${point.id}-loading`} />
                  : [
                      <DesktopForecastRow
                        key={`${point.id}-desktop`}
                        point={point}
                        date={date}
                        selected={
                          this.props.selectedComparisonPointId === point.id
                        }
                        onRemove={this.props.onRemoveComparisonPoint}
                        onClick={this.onClickRow}
                      />,
                      <PhoneForecastRow
                        key={`${point.id}-phone`}
                        point={point}
                        date={date}
                        selected={
                          this.props.selectedComparisonPointId === point.id
                        }
                        onRemove={this.props.onRemoveComparisonPoint}
                        onClick={this.onClickRow}
                      />,
                    ]
            )
          )}
        </tbody>
      </ComparisonTable>
    );
  }
}
