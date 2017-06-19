import styled from 'styled-components';
import React, {Component, PropTypes} from 'react';
import convert from 'convert-units';

import {
  getSortedPointsForDate,
  getScoreForDate,
} from 'app/containers/Database/selectors';
import {AugmentedComparisonShape} from 'app/propTypes';

const ColumnHeader = styled.th`
  text-align: left;
  padding: 5px 5px 0;
  font-size: 14px;
  font-weight: 400;
`;

const HeaderRow = styled.tr`
  ${ColumnHeader}:first-child {
    padding-left: 35px;
  }
`;

const UnitCell = styled.th`
  text-align: left;
  color: #aaa;
  font-weight: normal;
  font-size: 0.7em;
  padding: 0px 5px 5px;
`;

const Cell = styled.td`
  padding: 5px;
  font-weight: 300;
  font-size: 18;
  strong {
    font-weight: 400;
  }
`;

const Row = styled.tr`
  border-bottom: 1px solid #eee;
  ${Cell}:first-child {
    padding-left: 35px;
  }
`;

const ComparisonTable = styled.table`
  margin-bottom: 20px;
  width: 100%;
  ${Row}:first-child {
    border-top: 1px solid #eee;
  }
`;

export default class SingleDayForecastComparison extends Component {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
  };

  onRemoveComparisonPoint = event => {
    this.props.onRemoveComparisonPoint(event.target.value);
  };

  render() {
    const {comparison, date} = this.props;
    const sorted = getSortedPointsForDate(comparison, date);
    return (
      <ComparisonTable>
        <thead>
          <HeaderRow>
            <ColumnHeader colSpan={5} />
            <ColumnHeader colSpan={2} style={{paddingLeft: 30}}>
              Precipitation
            </ColumnHeader>
            <ColumnHeader colSpan={2} />
          </HeaderRow>
          <HeaderRow>
            <ColumnHeader>Score</ColumnHeader>
            <ColumnHeader>Name</ColumnHeader>
            <ColumnHeader>Low</ColumnHeader>
            <ColumnHeader>High</ColumnHeader>
            <ColumnHeader>Wind</ColumnHeader>
            <ColumnHeader>Chance</ColumnHeader>
            <ColumnHeader>Quantity</ColumnHeader>
            <ColumnHeader>Forecast</ColumnHeader>
            <ColumnHeader />
          </HeaderRow>
          <HeaderRow>
            <UnitCell />
            <UnitCell />
            <UnitCell>ºF</UnitCell>
            <UnitCell>ºF</UnitCell>
            <UnitCell>mph</UnitCell>
            <UnitCell>%</UnitCell>
            <UnitCell>in</UnitCell>
            <UnitCell />
            <UnitCell />
          </HeaderRow>
        </thead>
        <tbody>
          {sorted.map((point, index) => {
            if (!point.noaaGridForecast) {
              return (
                <Row key={point.name + index}>
                  <Cell />
                  <Cell>{point.name}</Cell>
                </Row>
              );
            }
            const score = getScoreForDate(point, date);
            return (
              <Row key={point.name + index}>
                <Cell>{score.score}</Cell>
                <Cell><strong>{point.name}</strong></Cell>
                <Cell>
                  {score.dailyForecast && score.dailyForecast.night.temperature}
                </Cell>
                <Cell>
                  {score.dailyForecast && score.dailyForecast.day.temperature}
                </Cell>
                <Cell>
                  {Math.round(convert(score.windSpeed).from('knot').to('m/h'))}
                </Cell>
                <Cell>
                  {isNaN(score.probabilityOfPrecipitation)
                    ? '-'
                    : Math.round(score.probabilityOfPrecipitation)}
                </Cell>
                <Cell>
                  {isNaN(score.quantitativePrecipitation)
                    ? '-'
                    : Math.round(
                        convert(score.quantitativePrecipitation)
                          .from('mm')
                          .to('in') * 100
                      ) / 100}
                </Cell>
                <Cell>
                  {score.dailyForecast && score.dailyForecast.day.shortForecast}
                </Cell>
                <Cell>
                  <button
                    type="button"
                    value={point.id}
                    onClick={this.onRemoveComparisonPoint}
                  >
                    X
                  </button>
                </Cell>
              </Row>
            );
          })}
        </tbody>
      </ComparisonTable>
    );
  }
}
