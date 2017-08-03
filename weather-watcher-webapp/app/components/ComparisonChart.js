import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment-mini';
import memoize from 'lodash.memoize';

import {Desktop, Phone} from 'app/components/Responsive';
import {AugmentedComparisonShape} from 'app/propTypes';
import {safeAverage} from 'app/utils/math';
import {getForecastDates} from 'app/utils/dates';
import {PointLink} from 'app/components/ForecastRow';

import LoadingIndicator from './LoadingIndicator';
import ScoreNumber from './ScoreNumber';

const Wrapper = styled.div``;

const Table = styled.table`
  font-size: 18px;
  td {
    text-align: center;
    padding: 5px;
    width: 60px;
  }
  > tbody > tr > td:first-child {
    text-align: left;
    font-weight: 500;
    width: 250px;
  }
  tr {
    border-bottom: 1px solid #eee;
  }
`;

const PhonePointRow = styled.div`
  border-bottom: 1px solid #eee;
  padding: 10px 0;
`;

const PhoneTable = styled.table`
  table-layout: fixed;
  thead,
  tr,
  td,
  th {
    border: 0;
    padding: 0;
  }
  td,
  th {
    font-size: small;
    font-weight: normal;
    text-align: center;
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
    padding-left: 5px;
  }
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
        <Desktop>
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
                      <PointLink to={`/locations/${point.id}`}>
                        {point.name}
                      </PointLink>
                    </PointName>
                    {dates.map(date => {
                      const score = point.interpolatedScore.getAverageScoreForDate(
                        date
                      );
                      return (
                        <td key={date.getTime()}>
                          <ScoreNumber score={score} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Desktop>
        <Phone>
          {sortedPoints.map(point => {
            if (point.isLoading) {
              return (
                <PhonePointRow key={point.id}>
                  <PointName colSpan={dates.length + 1}>
                    <LoadingIndicator /> Loading...
                  </PointName>
                </PhonePointRow>
              );
            } else if (point.isLoadingForecast) {
              return (
                <PhonePointRow key={point.id}>
                  <PointName className="truncate">
                    {point.name}
                  </PointName>
                  <div colSpan={dates.length}>
                    <LoadingIndicator /> Loading...
                  </div>
                </PhonePointRow>
              );
            }
            return (
              <PhonePointRow key={point.id}>
                <PointName className="truncate">
                  <PointLink to={`/locations/${point.id}`}>
                    {point.name}
                  </PointLink>
                </PointName>
                <PhoneTable>
                  <thead>
                    <tr>
                      {dates.map(date =>
                        <th
                          key={date}
                          onClick={this.onClickDate(date)}
                          selected={moment(date).isSame(this.props.date, 'day')}
                        >
                          {moment(date).format('ddd')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {dates.map(date => {
                        const score = point.interpolatedScore.getAverageScoreForDate(
                          date
                        );
                        return (
                          <td key={date.getTime()}>
                            <ScoreNumber score={score} />
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </PhoneTable>
              </PhonePointRow>
            );
          })}
        </Phone>
      </Wrapper>
    );
  }
}
