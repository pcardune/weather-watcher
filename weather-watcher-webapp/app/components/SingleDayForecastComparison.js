import styled from 'styled-components';
import React, {PureComponent, PropTypes} from 'react';
import convert from 'convert-units';
import LoadingIndicator from 'app/components/LoadingIndicator';
import {getAverageScoreForDate} from 'app/containers/Database/selectors';
import Button from 'app/components/Button';
import Number from 'app/components/Number';
import {AugmentedComparisonShape} from 'app/propTypes';
import {round} from 'app/utils/math';

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
  font-size: 18px;
  strong {
    font-weight: 400;
  }
`;

const PointLink = styled.a`
  color: ${props => props.theme.colors.primaryText};
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const ShortForecastCell = Cell.extend`
  font-size: 14px;
`;

const Row = styled.tr`
  border-bottom: 1px solid #eee;
  ${Cell}:first-child {
    padding-left: 35px;
  }
`;

const ComparisonTable = styled.table`
  width: 100%;
  ${Row}:first-child {
    border-top: 1px solid #eee;
  }
`;

function makeSortFunc(date) {
  return (p1, p2) =>
    p2.interpolatedScore.getAverageScoreForDate(date) -
    p1.interpolatedScore.getAverageScoreForDate(date);
}

export default class SingleDayForecastComparison extends PureComponent {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
  };

  render() {
    const {comparison, date} = this.props;
    const sorted = [...comparison.comparisonPoints];
    sorted.sort(makeSortFunc(date));
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
            <ColumnHeader style={{width: 50}}>Score</ColumnHeader>
            <ColumnHeader style={{minWidth: 200}}>Name</ColumnHeader>
            <ColumnHeader style={{width: 50}}>Low</ColumnHeader>
            <ColumnHeader style={{width: 50}}>High</ColumnHeader>
            <ColumnHeader style={{width: 50}}>Wind</ColumnHeader>
            <ColumnHeader style={{width: 50}}>Chance</ColumnHeader>
            <ColumnHeader style={{width: 50}}>Quantity</ColumnHeader>
            <ColumnHeader style={{width: 50}}>Forecast</ColumnHeader>
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
          {sorted.map(point => {
            if (
              !point.noaaGridForecast ||
              !point.noaaPoint ||
              !point.noaaDailyForecast
            ) {
              return (
                <Row key={point.id}>
                  <Cell>
                    <LoadingIndicator />
                  </Cell>
                  <Cell colSpan={8}>{point.name}</Cell>
                </Row>
              );
            }
            const score = getAverageScoreForDate(point, date);
            return (
              <Row key={point.id}>
                <Cell style={{position: 'relative'}}>
                  {point.isRefreshing
                    ? <LoadingIndicator />
                    : round(score.score)}
                </Cell>
                <Cell>
                  <PointLink
                    target="_blank"
                    href={
                      `http://forecast.weather.gov/MapClick.php?lon=${point.longitude}&lat=${point.latitude}`
                    }
                  >
                    {point.name}
                  </PointLink>
                </Cell>
                <Cell>
                  <Number value={score.minTemp} from="C" to="F" />
                </Cell>
                <Cell>
                  <Number value={score.maxTemp} from="C" to="F" />
                </Cell>
                <Cell>
                  <Number value={score.windSpeed} from="knot" to="m/h" />
                </Cell>
                <Cell>
                  <Number value={score.probabilityOfPrecipitation} />
                </Cell>
                <Cell>
                  <Number
                    value={score.quantitativePrecipitation}
                    from="mm"
                    to="in"
                    roundTo={2}
                  />
                </Cell>
                <ShortForecastCell>
                  {score.dailyForecast && score.dailyForecast.day.shortForecast}
                </ShortForecastCell>
                <Cell>
                  <Button
                    type="button"
                    value={point.id}
                    flat
                    style={{fontWeight: '500'}}
                    onClick={() => this.props.onRemoveComparisonPoint(point.id)}
                  >
                    X
                  </Button>
                </Cell>
              </Row>
            );
          })}
        </tbody>
      </ComparisonTable>
    );
  }
}
