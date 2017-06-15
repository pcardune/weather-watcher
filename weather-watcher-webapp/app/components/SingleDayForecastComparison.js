import styled from 'styled-components';
import React from 'react';
import moment from 'moment-mini';
import convert from 'convert-units';

const ComparisonTable = styled.table`
  margin-bottom: 20px;
  width: 100%;
`;

const DayHeader = styled.th`
  font-weight: bold;
  background-color: #eee;
  text-align: left;
  padding: 5px;
`;

const HeaderRow = styled.tr`
  border-bottom: 1px solid #ccc;
`;

const ColumnHeader = styled.th`
  text-align: left;
  padding: 5px 5px 0;
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
`;

const Row = styled.tr`
  border-bottom: 1px solid #ccc;
`;

export default function SingleDayForecastComparison({comparison, date}) {
  const sorted = comparison.getSortedPointsForDate(date);
  return (
    <ComparisonTable>
      <thead>
        <tr>
          <DayHeader colSpan={9}>
            {moment(date).format('dddd, MMMM Do')}
          </DayHeader>
        </tr>
        <tr>
          <ColumnHeader>Rank</ColumnHeader>
          <ColumnHeader>Name</ColumnHeader>
          <ColumnHeader>Score</ColumnHeader>
          <ColumnHeader>Low</ColumnHeader>
          <ColumnHeader>High</ColumnHeader>
          <ColumnHeader>Wind</ColumnHeader>
          <ColumnHeader>PoP</ColumnHeader>
          <ColumnHeader>Precip</ColumnHeader>
          <ColumnHeader>Forecast</ColumnHeader>
        </tr>
        <HeaderRow>
          <UnitCell />
          <UnitCell />
          <UnitCell />
          <UnitCell>ºF</UnitCell>
          <UnitCell>ºF</UnitCell>
          <UnitCell>mph</UnitCell>
          <UnitCell>%</UnitCell>
          <UnitCell>in</UnitCell>
          <UnitCell />
        </HeaderRow>
      </thead>
      <tbody>
        {sorted.map((point, index) => {
          const periods = point.noaaPoint.dailyForecast.data.properties.periods;
          const [day, night] = periods[0].isDaytime
            ? [periods[0], periods[1]]
            : [periods[1], periods[2]];
          const score = point.getScoreForDate(date);
          return (
            <Row key={point.name}>
              <Cell>{index + 1}</Cell>
              <Cell>{point.name}</Cell>
              <Cell>{score.score}</Cell>
              <Cell>{night.temperature}</Cell>
              <Cell>{day.temperature}</Cell>
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
              <Cell>{day.shortForecast}</Cell>
            </Row>
          );
        })}
      </tbody>
    </ComparisonTable>
  );
}
