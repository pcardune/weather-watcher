import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment-mini';
import memoize from 'lodash.memoize';

import {AugmentedComparisonShape} from 'app/propTypes';
import {safeAverage} from 'app/utils/math';

import {getScoreColor} from './ScoreNumber';
import Number from './Number';

const Table = styled.table`width: 100%;`;

const PointName = styled.td`
  padding: 0 ${props => props.theme.padding.standard};
  border-top: 1px solid ${props => props.theme.colors.divider};
`;

const Th = styled.th`
  font-weight: ${props => (props.selected ? 'bold' : 'normal')};
  cursor: pointer;
`;

const ScoreBox = styled.td`
  width: 11%;
  border: 1px solid ${props => props.theme.colors.divider};
  background-color: ${getScoreColor};
  color: ${props => props.theme.colors.textOnPrimary};
  text-align: center;
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

  getWeeklyScore = memoize(point => {
    const scores = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      scores.push(
        point.interpolatedScore.getAverageScoreForDate(
          moment(new Date()).startOf('date').add(dayOffset, 'days').toDate()
        ).score
      );
    }
    return safeAverage(scores);
  });

  render() {
    const dates = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      dates.push(
        moment(new Date()).startOf('date').add(dayOffset, 'days').toDate()
      );
    }

    const sortedPoints = [...this.props.comparison.comparisonPoints];
    sortedPoints.sort(
      (a, b) => this.getWeeklyScore(b) - this.getWeeklyScore(a)
    );
    return (
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
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
          {sortedPoints.map(point =>
            <tr key={point.id}>
              <PointName>
                {point.name}
              </PointName>
              {dates.map(date => {
                const score = point.interpolatedScore.getAverageScoreForDate(
                  date
                );
                return (
                  <ScoreBox key={date} score={score}>
                    <Number value={score.score} />
                  </ScoreBox>
                );
              })}
            </tr>
          )}
        </tbody>
      </Table>
    );
  }
}
