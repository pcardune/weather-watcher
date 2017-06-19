import React, {Component, PropTypes} from 'react';
import styled from 'styled-components';
import moment from 'moment-mini';
import {defaultMemoize} from 'reselect';
import {
  VictoryLabel,
  VictoryAxis,
  VictoryLine,
  VictoryChart,
  VictoryTooltip,
} from 'victory';
import {AugmentedComparisonShape} from 'app/propTypes';
import {getScoresForDate} from 'app/containers/Database/selectors';
import ComparisonGraphTheme from './ComparisonGraphTheme';
import Theme from 'app/Theme';

const ChartWrapper = styled.div`
  margin: 0px 0;
  overflow: hidden;
  > * {
    margin-top: -50px;
  }
`;

function DateLabel(props) {
  let style = props.style;
  if (props.text === moment(props.currentDate || new Date()).format('ddd')) {
    style = {...style, fill: Theme.colors.primary};
  }
  return (
    <VictoryLabel
      {...props}
      style={{...props.style, ...style, cursor: 'pointer'}}
      events={{onClick: () => props.onClick(new Date(props.datum))}}
    />
  );
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
      getScoresForDate(point, date).forEach(score => {
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

export default class ComparisonGraph extends Component {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    date: PropTypes.instanceOf(Date),
    onClickDate: PropTypes.func.isRequired,
  };

  getChartData = defaultMemoize(calculateChartData);

  render() {
    const {hasData, data, domain, dates} = this.getChartData(
      this.props.comparison
    );
    if (!hasData) {
      return null;
    }
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
              />
            }
            tickValues={dates.map(date => date.getTime())}
            tickFormat={time => moment(new Date(time)).format('ddd')}
            tickComponent={<EmptyTick />}
            axisComponent={<EmptyTick />}
          />
          {data.map((lineData, i) => (
            <VictoryLine
              key={i}
              data={lineData}
              labels={d => d.label}
              labelComponent={<VictoryTooltip />}
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
          <VictoryLine
            data={[
              {
                x: (this.props.date || new Date()).getTime(),
                y: domain.y[0],
              },
              {
                x: (this.props.date || new Date()).getTime(),
                y: domain.y[1],
              },
            ]}
            style={{data: {stroke: Theme.colors.primary, strokeWidth: 2}}}
          />
        </VictoryChart>
      </ChartWrapper>
    );
  }
}
