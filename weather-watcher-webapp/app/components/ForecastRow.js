import Truncate from 'react-truncate';
import styled from 'styled-components';
import React, {PureComponent, Component, PropTypes} from 'react';
import moment from 'moment-mini';

import SmartLink from 'app/components/SmartLink';
import LoadingIndicator from 'app/components/LoadingIndicator';
import RollupNumber from 'app/components/RollupNumber';
import ScoreNumber from 'app/components/ScoreNumber';
import ScoreComponentsDescription from 'app/components/ScoreComponentsDescription';

import {AugmentedComparisonPointShape} from 'app/propTypes';

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

export function LoadingRow() {
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

export default class ForecastRow extends Component {
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

  renderScoreCellContent() {
    return this.props.point.isRefreshing
      ? <LoadingIndicator />
      : <ScoreNumber
          score={this.props.point.interpolatedScore.getAverageScoreForDate(
            this.props.date
          )}
        />;
  }

  renderPointLink() {
    return (
      <PointLink to={`/locations/${this.props.point.id}`}>
        {this.props.getName(this.props)}
      </PointLink>
    );
  }

  renderShortForecast() {
    const dailyForecast = getDailyForecastForPoint(
      this.props.point,
      this.props.date
    );
    return (
      <Truncate>
        {ScoreComponentsDescription({
          badness: this.props.point.interpolatedScore.getBadnessForDate(
            this.props.date
          ),
          dailyForecast,
        })}
      </Truncate>
    );
  }

  renderPhoneCells() {
    const {date} = this.props;
    return (
      <Cell className="hide-on-large-only" colSpan="8">
        {this.renderPointLink()}
        <div>
          <RowLabel>Temp: </RowLabel>
          <PointForecastRollup
            date={date}
            property="temperature"
            point={this.props.point}
            type="min"
          />
          ºF /{' '}
          <PointForecastRollup
            date={date}
            property="temperature"
            point={this.props.point}
            type="max"
          />
          ºF
        </div>
        <div>
          <RowLabel>Wind: </RowLabel>
          <PointForecastRollup
            date={date}
            property="windSpeed"
            point={this.props.point}
          />
          mph
        </div>
        <div>
          <RowLabel>Rain: </RowLabel>
          <PointForecastRollup
            date={date}
            property="probabilityOfPrecipitation"
            point={this.props.point}
          />
          % /{' '}
          <PointForecastRollup
            date={date}
            property="quantitativePrecipitation"
            point={this.props.point}
          />
          {'"'}
        </div>
        <div>
          <RowLabel />
          {this.renderShortForecast()}
        </div>
      </Cell>
    );
  }

  renderDesktopCells() {
    const {date} = this.props;
    return [
      <Cell key="point-link" className="hide-on-med-and-down">
        {this.renderPointLink()}
      </Cell>,
      <Cell key="temp-min" className="hide-on-med-and-down">
        <PointForecastRollup
          date={date}
          property="temperature"
          point={this.props.point}
          type="min"
        />
      </Cell>,
      <Cell key="temp-max" className="hide-on-med-and-down">
        <PointForecastRollup
          date={date}
          property="temperature"
          point={this.props.point}
          type="max"
        />
      </Cell>,
      <Cell key="wind-speed" className="hide-on-med-and-down">
        <PointForecastRollup
          date={date}
          property="windSpeed"
          point={this.props.point}
          type="max"
        />
      </Cell>,
      <Cell key="probPrecip" className="hide-on-med-and-down">
        <PointForecastRollup
          date={date}
          property="probabilityOfPrecipitation"
          point={this.props.point}
          type="max"
        />
      </Cell>,
      <Cell key="quantPrecip" className="hide-on-med-and-down">
        <PointForecastRollup
          date={date}
          property="quantitativePrecipitation"
          point={this.props.point}
          type="sum"
        />
      </Cell>,
      <ShortForecastCell key="short-forecast" className="hide-on-med-and-down">
        {this.renderShortForecast()}
      </ShortForecastCell>,
    ];
  }

  render() {
    return (
      <Row key={this.props.point.id} selected={this.props.selected}>
        <Cell style={{position: 'relative'}}>
          {this.renderScoreCellContent()}
        </Cell>
        {this.renderDesktopCells()}
        {this.renderPhoneCells()}
      </Row>
    );
  }
}
