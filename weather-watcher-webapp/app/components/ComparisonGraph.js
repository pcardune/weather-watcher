import React, {Component, PropTypes} from 'react';
import moment from 'moment-mini';
import {VictoryTheme, VictoryAxis, VictoryLine, VictoryChart} from 'victory';
import {AugmentedComparisonShape} from 'app/propTypes';
import {
  getSortedPointsForDate,
  getScoreForDate,
} from 'app/containers/Database/selectors';
import ComparisonGraphTheme from './ComparisonGraphTheme';

export default class ComparisonGraph extends Component {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
  };

  render() {
    const {comparison} = this.props;
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
        }
      }
      return lineData;
    });
    console.log(data);
    return (
      <div style={{height: 200}}>
        <VictoryChart theme={ComparisonGraphTheme}>
          {data.map(lineData => (
            <VictoryLine
              data={lineData}
              y="score"
              x="date"
              theme={ComparisonGraphTheme}
            />
          ))}
        </VictoryChart>
      </div>
    );
  }
}
