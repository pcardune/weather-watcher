import React, {Component, PropTypes} from 'react';
import styled from 'styled-components';
import moment from 'moment-mini';
import {
  VictoryLabel,
  VictoryTheme,
  VictoryAxis,
  VictoryLine,
  VictoryChart,
} from 'victory';
import {AugmentedComparisonShape} from 'app/propTypes';
import {
  getSortedPointsForDate,
  getScoreForDate,
} from 'app/containers/Database/selectors';
import ComparisonGraphTheme from './ComparisonGraphTheme';

const ChartWrapper = styled.div`
  background: #eee;
  margin: 5px 0;
`;

function DateLabel(props) {
  let style = props.style;
  if (props.text === moment(new Date()).format('ddd')) {
    style = {...style, fill: 'red'};
  }
  return <VictoryLabel {...props} style={style} />;
}

export default class ComparisonGraph extends Component {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
  };

  render() {
    const {comparison} = this.props;
    const allScores = [];
    let hasData = false;
    const data = comparison.comparisonPoints.map(point => {
      const lineData = [];
      for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
        const date = moment(new Date()).add(dayOffset, 'days').toDate();
        const score = getScoreForDate(point, date);
        if (score.score) {
          lineData.push({
            score: score.score,
            dayOffset,
            date: moment(date).format('ddd'),
          });
          allScores.push(score.score);
        }
      }
      hasData = hasData || lineData.length > 0;
      return lineData;
    });
    if (!hasData) {
      return null;
    }
    const domain = {
      y: [Math.min(...allScores) - 2, Math.max(...allScores) + 2],
    };
    return (
      <ChartWrapper>
        <VictoryChart
          theme={ComparisonGraphTheme}
          domain={domain}
          domainPadding={{x: [20, 20], y: [10, 10]}}
        >
          <VictoryAxis
            orientation="bottom"
            tickLabelComponent={<DateLabel />}
          />
          <VictoryAxis
            dependentAxis
            tickCount={3}
            style={{grid: {strokeWidth: 0}}}
          />
          {data.map((lineData, i) => (
            <VictoryLine
              key={i}
              data={lineData}
              y="score"
              x="date"
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
              {date: moment(new Date()).format('ddd'), score: domain.y[0]},
              {date: moment(new Date()).format('ddd'), score: domain.y[1]},
            ]}
            y="score"
            x="date"
            style={{data: {stroke: 'red', strokeWidth: 2}}}
          />
        </VictoryChart>
      </ChartWrapper>
    );
  }
}
