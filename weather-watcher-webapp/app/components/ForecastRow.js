import Truncate from 'react-truncate';
import styled from 'styled-components';
import React, {PureComponent, PropTypes} from 'react';
import moment from 'moment-mini';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

import {Desktop} from 'app/components/Responsive';
import SmartLink from 'app/components/SmartLink';
import LoadingIndicator from 'app/components/LoadingIndicator';
import Button from 'app/components/Button';
import ForecastTableHeader from 'app/components/ForecastTableHeader';
import RollupNumber from 'app/components/RollupNumber';
import ScoreNumber from 'app/components/ScoreNumber';
import ScoreComponentsDescription from 'app/components/ScoreComponentsDescription';

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

export const PointLink = styled(SmartLink)`
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

const Row = styled.tr`
  &:first-child {
    border-top: 1px solid #eee;
  }

  border-bottom: 1px solid #eee;
  background: ${props =>
    props.selected ? props.theme.colors.primaryLight : 'transparent'};
  cursor: pointer;

  ${props => (props.phoneOnly ? HideOnDesktop(props) : '')} ${props =>
      props.desktopOnly ? HideOnPhone(props) : ''};
`;

const HideOnDesktop = props => props.theme.media.desktop`
  display: none;
`;

const HideOnPhone = props => props.theme.media.phone`
  display: none;
`;

export function LoadingRow(date) {
  return (
    <Row>
      <Cell colSpan={9}>
        <LoadingIndicator /> Loading...
      </Cell>
    </Row>
  );
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

export class DesktopForecastRow extends PureComponent {
  static propTypes = {
    point: AugmentedComparisonPointShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    selected: PropTypes.bool,
    onRemove: PropTypes.func,
    onClick: PropTypes.func,
    getName: PropTypes.func,
  };

  static defaultProps = {
    selected: false,
    onRemove: () => {},
    onClick: () => {},
    getName: props => props.point.name,
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
      <Row desktopOnly key={point.id} selected={this.props.selected}>
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
          <PointLink to={`/locations/${point.id}`}>
            {this.props.getName(this.props)}
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

export class PhoneForecastRow extends PureComponent {
  static propTypes = {
    point: AugmentedComparisonPointShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func,
    getName: PropTypes.func,
  };

  static defaultProps = {
    selected: false,
    onClick: () => {},
    getName: props => props.point.name,
  };

  onClick = () => {
    this.props.onClick(this.props.point);
  };

  render() {
    const {point, date} = this.props;
    const dailyForecast = getDailyForecastForPoint(point, date);
    return (
      <Row phoneOnly key={point.id} selected={this.props.selected}>
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
          <PointLink to={`/locations/${point.id}`}>
            {this.props.getName(this.props)}
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

export default props => {
  return (
    <Desktop>
      {isDesktop =>
        isDesktop
          ? <DesktopForecastRow {...props} />
          : <PhoneForecastRow {...props} />}
    </Desktop>
  );
};
