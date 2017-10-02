import Truncate from 'react-truncate';
import styled from 'styled-components';
import React, {PureComponent, Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-mini';
import {Hidden} from 'material-ui';

import SmartLink from 'app/components/SmartLink';
import LoadingIndicator from 'app/components/LoadingIndicator';
import RollupNumber from 'app/components/RollupNumber';
import ScoreNumber from 'app/components/ScoreNumber';
import getScoreComponentsDescription from 'app/components/getScoreComponentsDescription';

import {AugmentedComparisonPointShape} from 'app/propTypes';

const RowLabel = styled.span`
  font-size: .8em;
  color: ${props => props.theme.colors.secondaryText};
  display: block;
`;

const Cell = styled.td`
  padding: 5px;
  font-weight: 300;
  font-size: 18px;
  strong {
    font-weight: 400;
  }

  &.phone {
    > div {
      display: flex;
      ${RowLabel} {
        flex-basis: 4em;
        flex-shrink: 0;
      }
    }
  }
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
  cursor: pointer;
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
  const weatherProps =
    point.interpolatedScore.grid.timeSeries.weather.interpolate(
      date.getTime()
    ) || [];

  let desc = [];
  weatherProps.forEach(({coverage, intensity, weather}) => {
    let s = '';
    if (coverage) {
      s += coverage + ' of ';
    }
    if (intensity) {
      s += intensity + ' ';
    }
    if (weather) {
      s += weather;
    }
    desc.push(s);
  });
  return desc.join(' then ').replace(/_/g, ' ');
}

class TruncateToggle extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    truncate: PropTypes.bool,
  };
  static defaultProps = {
    truncate: false,
  };
  state = {
    truncate: this.props.truncate,
  };
  toggleTruncate = () => this.setState({truncate: !this.state.truncate});
  render() {
    const {children} = this.props;
    if (this.state.truncate) {
      return (
        <Truncate onClick={this.toggleTruncate}>
          {children}
        </Truncate>
      );
    } else {
      return (
        <span onClick={this.toggleTruncate}>
          {children}
        </span>
      );
    }
  }
}

export default class ForecastRow extends Component {
  static propTypes = {
    point: AugmentedComparisonPointShape.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    onRemove: PropTypes.func,
    onClick: PropTypes.func,
    getName: PropTypes.func,
  };

  static defaultProps = {
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

  renderShortForecast({truncate}) {
    const dailyForecast = getDailyForecastForPoint(
      this.props.point,
      this.props.date
    );
    return (
      <TruncateToggle truncate={truncate}>
        {getScoreComponentsDescription({
          badness: this.props.point.interpolatedScore.getBadnessForDate(
            this.props.date
          ),
          dailyForecast,
        })}
      </TruncateToggle>
    );
  }

  renderPhoneCells() {
    const {date} = this.props;
    return (
      <Hidden lgUp>
        <Cell colSpan="8" className="phone">
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
            {this.renderShortForecast({truncate: false})}
          </div>
        </Cell>
      </Hidden>
    );
  }

  renderDesktopCells() {
    const {date} = this.props;
    return [
      <Cell key="point-link">
        {this.renderPointLink()}
      </Cell>,
      <Cell key="temp-min">
        <PointForecastRollup
          date={date}
          property="temperature"
          point={this.props.point}
          type="min"
        />
      </Cell>,
      <Cell key="temp-max">
        <PointForecastRollup
          date={date}
          property="temperature"
          point={this.props.point}
          type="max"
        />
      </Cell>,
      <Cell key="wind-speed">
        <PointForecastRollup
          date={date}
          property="windSpeed"
          point={this.props.point}
          type="max"
        />
      </Cell>,
      <Cell key="probPrecip">
        <PointForecastRollup
          date={date}
          property="probabilityOfPrecipitation"
          point={this.props.point}
          type="max"
        />
      </Cell>,
      <Cell key="quantPrecip">
        <PointForecastRollup
          date={date}
          property="quantitativePrecipitation"
          point={this.props.point}
          type="sum"
        />
      </Cell>,
      <ShortForecastCell key="short-forecast">
        {this.renderShortForecast({truncate: true})}
      </ShortForecastCell>,
    ].map((cell, index) =>
      <Hidden mdDown key={index}>
        {cell}
      </Hidden>
    );
  }

  render() {
    return (
      <Row key={this.props.point.id}>
        <Cell style={{position: 'relative'}}>
          {this.renderScoreCellContent()}
        </Cell>
        {this.renderDesktopCells()}
        {this.renderPhoneCells()}
      </Row>
    );
  }
}
