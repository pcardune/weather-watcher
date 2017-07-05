import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment-mini';
import {defaultMemoize} from 'reselect';
import {
  Line,
  VictoryLabel,
  VictoryArea,
  VictoryAxis,
  VictoryLine,
  VictoryChart,
  VictoryTooltip,
} from 'victory';
import {AugmentedComparisonShape} from 'app/propTypes';
import Theme from 'app/Theme';
import ComparisonGraphTheme from './ComparisonGraphTheme';

const ChartWrapper = styled.div`
  margin: 0px 0;
  overflow: hidden;
  > * {
    margin-top: -50px;
  }
`;

class DateGridLine extends Component {
  static propTypes = {
    datum: PropTypes.number.isRequired,
  };

  static defaultProps = {
    datum: 0,
  };

  render() {
    if (moment(this.props.datum).hour() !== 0) {
      // only show labels at midnight
      return null;
    }
    return <Line type="grid" {...this.props} />;
  }
}

class DateLabel extends Component {
  static propTypes = {
    style: PropTypes.object,
    currentDate: PropTypes.instanceOf(Date),
    onClick: PropTypes.func.isRequired,
    tickValues: PropTypes.arrayOf(PropTypes.number),
    index: PropTypes.number,
  };

  static defaultProps = {
    style: {},
    currentDate: new Date(),
    tickValues: [],
    index: 0,
  };

  static FORMAT = 'ddd';

  render() {
    let style = this.props.style;
    const datum = this.props.tickValues[this.props.index];
    if (
      moment(this.props.currentDate)
        .startOf('day')
        .isSame(moment(datum).startOf('day'))
    ) {
      style = {...style, fill: Theme.colors.primary};
    }
    if (moment(datum).hour() !== 12) {
      // only show labels at noon
      return null;
    }
    return (
      <VictoryLabel
        {...this.props}
        style={{...this.props.style, ...style, cursor: 'pointer'}}
        events={{
          onClick: () =>
            this.props.onClick(moment(datum).startOf('day').toDate()),
        }}
      />
    );
  }
}

function EmptyTick() {
  return null;
}

const calculateChartData = comparison => {
  let minScore = Infinity;
  let maxScore = -Infinity;
  let minTime = Infinity;
  let maxTime = -Infinity;
  let hasData = false;

  const dates = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    dates.push(
      moment(new Date()).startOf('date').add(dayOffset, 'days').toDate()
    );
  }
  const data = comparison.comparisonPoints.map(point => {
    const lineData = [];
    dates.slice(0, 6).forEach(date => {
      if (!point.interpolatedScore) {
        return;
      }
      point.interpolatedScore.getScoresForDate(date).forEach(score => {
        if (score.score) {
          minScore = Math.min(score.score, minScore);
          maxScore = Math.max(score.score, maxScore);
          minTime = Math.min(score.time, minTime);
          maxTime = Math.max(score.time, maxTime);
          lineData.push({
            y: score.score,
            x: score.time,
            label: point.name,
          });
        }
      });
    });
    hasData = hasData || lineData.length > 0;
    return lineData;
  });
  const domain = {
    y: [minScore - 2, maxScore + 2],
    x: [minTime, maxTime],
  };
  return {
    hasData,
    data,
    domain,
    dates,
  };
};

class FastLine extends Component {
  static propTypes = VictoryLine.propTypes;

  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }
  render() {
    return <VictoryLine {...this.props} />;
  }
}

export default class ComparisonGraph extends PureComponent {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    date: PropTypes.instanceOf(Date),
    onClickDate: PropTypes.func.isRequired,
  };

  getChartData = defaultMemoize(calculateChartData);

  labelComponent = <VictoryTooltip />;
  getLabel = d => d.label;

  render() {
    const {hasData, data, domain, dates} = this.getChartData(
      this.props.comparison
    );
    if (!hasData) {
      return null;
    }
    const tickValues = [];
    dates.forEach(date => {
      tickValues.push(date.getTime());
      tickValues.push(date.getTime() + 1000 * 60 * 60 * 12);
    });

    return (
      <ChartWrapper>
        <VictoryChart
          theme={ComparisonGraphTheme}
          domain={domain}
          domainPadding={{x: [20, 20], y: [0, 0]}}
        >
          <VictoryAxis
            orientation="bottom"
            tickLabelComponent={
              <DateLabel
                currentDate={this.props.date}
                onClick={this.props.onClickDate}
                tickValues={tickValues}
              />
            }
            tickValues={tickValues}
            gridComponent={<DateGridLine />}
            tickFormat={time => moment(new Date(time)).format(DateLabel.FORMAT)}
            tickComponent={<EmptyTick />}
            axisComponent={<EmptyTick />}
          />
          <VictoryArea
            data={[
              {
                x: this.props.date.getTime(),
                y: domain.y[1],
              },
              {
                x: this.props.date.getTime() + 1000 * 60 * 60 * 24,
                y: domain.y[1],
              },
            ]}
            style={{data: {fill: Theme.colors.primaryLight}}}
          />
          {data.map((lineData, i) => (
            <FastLine
              key={i}
              data={lineData}
              labels={this.getLabel}
              labelComponent={this.labelComponent}
              interpolation="basis"
              style={{
                data: {
                  stroke: ComparisonGraphTheme.stack.colorScale[
                    i % ComparisonGraphTheme.stack.colorScale.length
                  ],
                },
              }}
              theme={ComparisonGraphTheme}
            />
          ))}
        </VictoryChart>
      </ChartWrapper>
    );
  }
}
