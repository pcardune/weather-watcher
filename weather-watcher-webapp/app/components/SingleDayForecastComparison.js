import Truncate from 'react-truncate';
import styled from 'styled-components';
import React, {PureComponent, PropTypes} from 'react';
import LoadingIndicator from 'app/components/LoadingIndicator';
import Button from 'app/components/Button';
import RollupNumber from 'app/components/RollupNumber';
import moment from 'moment-mini';
import {
  AugmentedComparisonShape,
  AugmentedComparisonPointShape,
} from 'app/propTypes';

const DeleteButton = styled(Button)`
  position: absolute;
  top: 0px;
  right: 0px;
`;

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
  ${props => props.theme.media.phone`
    display: none;
  `}
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
  width: 150px;
  overflow: hidden;
  padding: 0px;
`;

const HideOnDesktop = props => props.theme.media.desktopOnly`
  display: none;
`;

const HideOnPhone = props => props.theme.media.phone`
  display: none;
`;

const Row = styled.tr`
  border-bottom: 1px solid #eee;
  ${Cell}:first-child {
    padding-left: 35px;
  }
  background: ${props => props.selected ? props.theme.colors.primaryLight : 'transparent'};
  cursor: pointer;

  ${props => props.phoneOnly ? HideOnDesktop(props) : ''}
  ${props => props.desktopOnly ? HideOnPhone(props) : ''}
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

class PointForecastRollup extends PureComponent {
  static propTypes = {
    ...RollupNumber.propTypes,
    point: AugmentedComparisonPointShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    property: PropTypes.string.isRequired,
  };

  static defaults = {
    temperature: {from: 'C', to: 'F'},
    windSpeed: {from: 'knot', to: 'm/h'},
    quantitativePrecipitation: {from: 'mm', to: 'in', roundTo: 2},
  };

  render() {
    const {point, property, date, ...rest} = this.props;
    const defaultRest = PointForecastRollup.defaults[property] || {};
    return (
      <RollupNumber
        values={point.interpolatedScore.grid.getValuesForDate(property, date)}
        {...defaultRest}
        {...rest}
      />
    );
  }
}

function getDailyForecastForPoint(point, date) {
  const dailyForecast = {
    day: {},
    night: {},
  };
  if (point.noaaDailyForecast) {
    point.noaaDailyForecast.properties.periods.forEach(period => {
      if (moment(new Date(period.startTime)).isSame(date, 'day')) {
        if (period.isDaytime) {
          dailyForecast.day = period;
        } else {
          dailyForecast.night = period;
        }
      }
    });
  }
  return dailyForecast;
}

class DesktopForecastRow extends PureComponent {
  static propTypes = {
    point: AugmentedComparisonPointShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    selected: PropTypes.bool.isRequired,
    onRemove: PropTypes.func.isRequired,
  };
  render() {
    const {point, date} = this.props;
    const dailyForecast = getDailyForecastForPoint(point, date);
    return (
      <Row
        desktopOnly
        key={point.id}
        onClick={() => this.onClickRow(point)}
        selected={this.props.selected}
      >
        <Cell style={{position: 'relative'}}>
          {point.isRefreshing
            ? <LoadingIndicator />
            : <RollupNumber
                values={point.interpolatedScore
                  .getScoresForDate(date)
                  .map(s => s.score)}
              />}
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
          <PointForecastRollup
            date={date}
            property="temperature"
            point={point}
            type="min"
          />
        </Cell>
        <Cell>
          <PointForecastRollup
            date={date}
            property="temperature"
            point={point}
            type="max"
          />
        </Cell>
        <Cell>
          <PointForecastRollup date={date} property="windSpeed" point={point} />
        </Cell>
        <Cell>
          <PointForecastRollup
            date={date}
            property="probabilityOfPrecipitation"
            point={point}
          />
        </Cell>
        <Cell>
          <PointForecastRollup
            date={date}
            property="quantitativePrecipitation"
            point={point}
          />
        </Cell>
        <ShortForecastCell>
          <Truncate>{dailyForecast.day.shortForecast}</Truncate>
        </ShortForecastCell>
        <Cell>
          <DeleteButton
            type="button"
            value={point.id}
            flat
            style={{fontWeight: '500'}}
            onClick={() => this.props.onRemove(point.id)}
          >
            X
          </DeleteButton>
        </Cell>
      </Row>
    );
  }
}

class PhoneForecastRow extends PureComponent {
  static propTypes = {
    point: AugmentedComparisonPointShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    selected: PropTypes.bool.isRequired,
  };
  render() {
    const {point, date} = this.props;
    const dailyForecast = getDailyForecastForPoint(point, date);
    return (
      <Row
        phoneOnly
        key={point.id}
        onClick={() => this.onClickRow(point)}
        selected={this.props.selected}
      >
        <Cell style={{position: 'relative'}}>
          {point.isRefreshing
            ? <LoadingIndicator />
            : <RollupNumber
                values={point.interpolatedScore
                  .getScoresForDate(date)
                  .map(s => s.score)}
              />}
        </Cell>
        <Cell colSpan="8">
          <PointLink
            target="_blank"
            href={
              `http://forecast.weather.gov/MapClick.php?lon=${point.longitude}&lat=${point.latitude}`
            }
          >
            {point.name}
          </PointLink>
          <div>
            Temp:{' '}
            <PointForecastRollup
              date={date}
              property="temperature"
              point={point}
              type="min"
            />
            ºF /
            {' '}
            <PointForecastRollup
              date={date}
              property="temperature"
              point={point}
              type="max"
            />
            ºF
          </div>
          <div>
            Wind:{' '}
            <PointForecastRollup
              date={date}
              property="windSpeed"
              point={point}
            />
            mph
          </div>
          <div>
            Rain{' '}
            <PointForecastRollup
              date={date}
              property="probabilityOfPrecipitation"
              point={point}
            />
            % /{' '}
            <PointForecastRollup
              date={date}
              property="quantitativePrecipitation"
              point={point}
            />
            {'"'}
          </div>
          {dailyForecast.day.shortForecast}
        </Cell>
      </Row>
    );
  }
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
        <thead>
          <HeaderRow>
            <ColumnHeader colSpan={5} />
            <ColumnHeader colSpan={2} style={{textAlign: 'center'}}>
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
            <ColumnHeader style={{width: 150}}>Forecast</ColumnHeader>
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
          {[].concat(
            ...sorted.map(point => {
              if (point.isRefreshing) {
                return [
                  <Row key={point.id}>
                    <Cell>
                      <LoadingIndicator />
                    </Cell>
                    <Cell colSpan={8}>{point.name}</Cell>
                  </Row>,
                ];
              }
              return [
                <DesktopForecastRow
                  key={`${point.id}-desktop`}
                  point={point}
                  date={date}
                  selected={this.props.selectedComparisonPointId === point.id}
                  onRemove={this.props.onRemoveComparisonPoint}
                />,
                <PhoneForecastRow
                  key={`${point.id}-phone`}
                  point={point}
                  date={date}
                  selected={this.props.selectedComparisonPointId === point.id}
                  onRemove={this.props.onRemoveComparisonPoint}
                />,
              ];
            })
          )}
        </tbody>
      </ComparisonTable>
    );
  }
}
