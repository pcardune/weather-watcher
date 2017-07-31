import Truncate from 'react-truncate';
import styled from 'styled-components';
import React, {PureComponent, PropTypes} from 'react';
import moment from 'moment-mini';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

import LoadingBar from './LoadingBar';
import LoadingIndicator from 'app/components/LoadingIndicator';
import Button from 'app/components/Button';
import ForecastTableHeader from 'app/components/ForecastTableHeader';
import RollupNumber from 'app/components/RollupNumber';
import ScoreNumber from 'app/components/ScoreNumber';
import {SCORE_MULTIPLIERS, SCORE_COMPONENTS} from 'app/constants';

import {
  AugmentedComparisonShape,
  AugmentedComparisonPointShape,
} from 'app/propTypes';

const Cell = styled.td`
  padding: 5px;
  font-weight: 300;
  font-size: 18px;
  strong {
    font-weight: 400;
  }
`;

const RowLabel = styled.span`
  font-size: .8em;
  color: ${props => props.theme.colors.secondaryText};
  display: inline-block;
  width: 4em;
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

const HideOnDesktop = props => props.theme.media.desktop`
  display: none;
`;

const HideOnPhone = props => props.theme.media.phone`
  display: none;
`;

const Row = styled.tr`
  border-bottom: 1px solid #eee;
  ${Cell}:first-child {
    padding-left: 35px;
    ${props => props.theme.media.phone`padding-left: 10px`};
  }
  background: ${props =>
    props.selected ? props.theme.colors.primaryLight : 'transparent'};
  cursor: pointer;

  ${props => (props.phoneOnly ? HideOnDesktop(props) : '')} ${props =>
      props.desktopOnly ? HideOnPhone(props) : ''};
`;

const ComparisonTable = styled.table`
  width: 100%;
  ${Row}:first-child {
    border-top: 1px solid #eee;
  }
`;

function LoadingRow(date) {
  return (
    <Row>
      <Cell colSpan={9}>
        <LoadingIndicator /> Loading...
      </Cell>
    </Row>
  );
}

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

export function getDailyForecastForPoint(point, date) {
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

export const ScoreComponentsDescription = ({scoreComponents}) => {
  const componentsByScore = {
    red: [],
    yellow: [],
    green: [],
  };
  for (const key in SCORE_COMPONENTS) {
    if (scoreComponents[key] <= SCORE_MULTIPLIERS.red) {
      componentsByScore.red.push(SCORE_COMPONENTS[key].name);
    } else if (scoreComponents[key] <= SCORE_MULTIPLIERS.yellow) {
      componentsByScore.yellow.push(SCORE_COMPONENTS[key].name);
    } else {
      componentsByScore.green.push(SCORE_COMPONENTS[key].name);
    }
  }
  return (
    <ul>
      <li>
        Green: {componentsByScore.green.join(', ')}
      </li>
      <li>
        Yellow: {componentsByScore.yellow.join(', ')}
      </li>
      <li>
        Red: {componentsByScore.red.join(', ')}
      </li>
    </ul>
  );
};

class DesktopForecastRow extends PureComponent {
  static propTypes = {
    point: AugmentedComparisonPointShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    selected: PropTypes.bool.isRequired,
    onRemove: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  onClick = () => {
    this.props.onClick(this.props.point);
  };

  render() {
    const {point, date} = this.props;
    const dailyForecast = getDailyForecastForPoint(point, date);
    const scoreTooltip = (
      <span>
        <ScoreComponentsDescription
          scoreComponents={point.interpolatedScore.getBadnessForDate(
            this.props.date
          )}
        />
      </span>
    );

    return (
      <Row
        desktopOnly
        key={point.id}
        onClick={this.onClick}
        selected={this.props.selected}
      >
        <Cell style={{position: 'relative'}}>
          {point.isRefreshing
            ? <LoadingIndicator />
            : <Tooltip placement="left" overlay={scoreTooltip}>
                <span>
                  <ScoreNumber
                    score={point.interpolatedScore.getAverageScoreForDate(
                      this.props.date
                    )}
                  />
                </span>
              </Tooltip>}
        </Cell>
        <Cell>
          <PointLink
            target="_blank"
            href={`http://forecast.weather.gov/MapClick.php?lon=${point.longitude}&lat=${point.latitude}`}
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
          <PointForecastRollup
            date={date}
            property="windSpeed"
            point={point}
            type="max"
          />
        </Cell>
        <Cell>
          <PointForecastRollup
            date={date}
            property="probabilityOfPrecipitation"
            point={point}
            type="max"
          />
        </Cell>
        <Cell>
          <PointForecastRollup
            date={date}
            property="quantitativePrecipitation"
            point={point}
            type="sum"
          />
        </Cell>
        <ShortForecastCell>
          <Truncate>
            {dailyForecast.day.shortForecast}
          </Truncate>
        </ShortForecastCell>
        <Cell>
          {/*<Button
              type="button"
              value={point.id}
              flat
              style={{fontWeight: '500'}}
              onClick={() => this.props.onRemove(point.id)}
              >
              X
              </Button>*/}
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
    onClick: PropTypes.func.isRequired,
  };

  onClick = () => {
    this.props.onClick(this.props.point);
  };

  render() {
    const {point, date} = this.props;
    const dailyForecast = getDailyForecastForPoint(point, date);
    return (
      <Row
        phoneOnly
        key={point.id}
        onClick={this.onClick}
        selected={this.props.selected}
      >
        <Cell style={{position: 'relative'}}>
          {point.isLoading
            ? <LoadingIndicator />
            : <ScoreNumber
                score={point.interpolatedScore.getAverageScoreForDate(
                  this.props.date
                )}
              />}
        </Cell>
        <Cell colSpan="8">
          <PointLink
            target="_blank"
            href={`http://forecast.weather.gov/MapClick.php?lon=${point.longitude}&lat=${point.latitude}`}
          >
            {point.name}
          </PointLink>
          <div>
            <RowLabel>Temp: </RowLabel>
            <PointForecastRollup
              date={date}
              property="temperature"
              point={point}
              type="min"
            />
            ºF /{' '}
            <PointForecastRollup
              date={date}
              property="temperature"
              point={point}
              type="max"
            />
            ºF
          </div>
          <div>
            <RowLabel>Wind: </RowLabel>
            <PointForecastRollup
              date={date}
              property="windSpeed"
              point={point}
            />
            mph
          </div>
          <div>
            <RowLabel>Rain: </RowLabel>
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
          <div>
            <RowLabel />
            {dailyForecast.day.shortForecast}
          </div>
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
        <ForecastTableHeader />
        <tbody>
          {[].concat(
            ...sorted.map(point => {
              if (point.isRefreshing) {
                return [
                  <Row key={point.id}>
                    <Cell>
                      <LoadingIndicator />
                    </Cell>
                    <Cell colSpan={8}>
                      {point.name}
                    </Cell>
                  </Row>,
                ];
              }
              return point.isLoading || point.isLoadingForecast
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
                  ];
            })
          )}
        </tbody>
      </ComparisonTable>
    );
  }
}
