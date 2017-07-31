import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment-mini';
import memoize from 'lodash.memoize';

import {AugmentedComparisonShape} from 'app/propTypes';
import {safeAverage} from 'app/utils/math';
import {getForecastDates} from 'app/utils/dates';

import LoadingIndicator from './LoadingIndicator';
import ScoreNumber, {getScoreColor} from './ScoreNumber';
import Number from './Number';

const Wrapper = styled.div``;

const Table = styled.table`
  font-size: 18px;
  td {
    text-align: center;
    padding: 5px;
    width: 60px;
  }
  td:first-child {
    text-align: left;
    padding-left: 25px;
    font-weight: 500;
    width: 250px;
  }
  tr {
    border-bottom: 1px solid #eee;
  }
`;

const PointName = styled.td`
  padding: 0 0 0 ${props => props.theme.padding.standard};
  ${props => props.theme.media.phone`padding: 0 5px;`};
`;

const Th = styled.th`
  font-weight: ${props => (props.selected ? 'bold' : 'normal')};
  cursor: pointer;
  text-align: center;
  padding: 0;
  font-size: 14px;
  &:first-child {
    text-align: left;
    padding-left: ${props => props.theme.padding.standard};
  }
`;

const ScoreBox = styled.td`
  padding: 0;
  width: 10%;
  border: 1px solid ${props => props.theme.colors.textOnPrimary};
  background-color: ${getScoreColor};
  color: ${props => props.theme.colors.primaryText};
  text-align: center;
  font-weight: 300;
`;

export default class ComparisonChart extends PureComponent {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    onClickDate: PropTypes.func.isRequired,
  };

  onClickDate = memoize(date => () => {
    this.props.onClickDate(date);
  });

  getWeeklyScore = memoize(point =>
    safeAverage(
      getForecastDates().map(
        date => point.interpolatedScore.getAverageScoreForDate(date).score
      )
    )
  );

  render() {
    const dates = getForecastDates();

    const sortedPoints = [...this.props.comparison.comparisonPoints];
    sortedPoints.sort((a, b) => {
      if (a.isLoading || b.isLoading) {
        return a.isLoading ? 1 : -1;
      }
      return this.getWeeklyScore(b) - this.getWeeklyScore(a);
    });
    return (
      <Wrapper>
        <Table>
          <thead>
            <tr>
              <Th>Location</Th>
              {dates.map(date =>
                <Th
                  key={date}
                  onClick={this.onClickDate(date)}
                  selected={moment(date).isSame(this.props.date, 'day')}
                >
                  {moment(date).format('ddd')}
                </Th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedPoints.map(point => {
              let content;
              if (point.isLoading) {
                return (
                  <tr key={point.id}>
                    <PointName colSpan={dates.length + 1}>
                      <LoadingIndicator /> Loading...
                    </PointName>
                  </tr>
                );
              } else if (point.isLoadingForecast) {
                return (
                  <tr key={point.id}>
                    <PointName className="truncate">
                      {point.name}
                    </PointName>
                    <td colSpan={dates.length}>
                      <LoadingIndicator /> Loading...
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={point.id}>
                  <PointName className="truncate">
                    {point.name}
                  </PointName>
                  {dates.map(date => {
                    const score = point.interpolatedScore.getAverageScoreForDate(
                      date
                    );
                    return (
                      <td>
                        <ScoreNumber score={score} />
                      </td>
                    );
                    return (
                      <ScoreBox key={date} score={score}>
                        <Number value={score.score} />
                      </ScoreBox>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Wrapper>
    );
  }
}
