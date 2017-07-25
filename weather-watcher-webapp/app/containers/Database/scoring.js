import {InterpolatedSequence, safeAverage} from 'app/utils/math';
import moment from 'moment-mini';

export class InterpolatedGridForecast {
  constructor(noaaGridForecast = {properties: {}}) {
    this.timeSeries = {};
    Object.keys(noaaGridForecast.properties).forEach(prop => {
      const values = noaaGridForecast.properties[prop].values;
      if (values) {
        this.timeSeries[prop] = new InterpolatedSequence(
          values.map(props => {
            const {validTime, value} = props;
            return {
              value,
              time: new Date(validTime.split('/')[0]).getTime(),
            };
          })
        );
      }
    });
  }

  getValue(propName, time) {
    if (!this.timeSeries[propName]) {
      return null;
    }
    return this.timeSeries[propName].interpolate(time);
  }

  getValuesForDate(propName, date, interval = 'PT1H') {
    return this.getValuesForInterval(
      propName,
      moment(date).startOf('date').valueOf(),
      moment(date).endOf('date').valueOf(),
      interval
    );
  }

  getValuesForInterval(propName, startTime, endTime, interval = 'PT1H') {
    const values = [];

    const duration = moment.duration(interval);
    for (
      let t = startTime;
      t < endTime;
      t = moment(t).add(duration).valueOf()
    ) {
      values.push(this.getValue(propName, t));
    }
    return values;
  }
}

const WEIGHTS = {
  WIND_SPEED: -1,
  PRECIPITATION_PERCENT: -0.5,
  PRECIPITATION_QUANTITY: -1,
  TEMP: -2,
};

function getScoreForTime(grid, time, scoreConfig) {
  const precip = grid.getValue('probabilityOfPrecipitation', time);
  const windSpeed = grid.getValue('windSpeed', time);
  const precipQuantity = grid.getValue('quantitativePrecipitation', time);
  const temp = grid.getValue('temperature', time);
  const score =
    100 +
    Math.round(
      WEIGHTS.PRECIPITATION_QUANTITY * precipQuantity +
        WEIGHTS.PRECIPITATION_PERCENT * precip +
        WEIGHTS.WIND_SPEED * windSpeed +
        WEIGHTS.TEMP * Math.abs(temp - scoreConfig.idealTemp)
    );
  return {score, time};
}

export class InterpolatedScoreFunction {
  constructor({interpolatedGridForecast, scoreConfig}) {
    this.grid = interpolatedGridForecast;
    this.scoreConfig = scoreConfig;
  }

  getScore(time) {
    return getScoreForTime(this.grid, time, this.scoreConfig);
  }

  getScoresForDate(date, interval = 'PT1H') {
    return this.getScoresForInterval(
      moment(date).startOf('date').valueOf(),
      moment(date).endOf('date').valueOf(),
      interval
    );
  }

  getScoresForInterval(startTime, endTime, interval = 'PT1H') {
    const scores = [];

    const duration = moment.duration(interval);
    for (
      let t = startTime;
      t < endTime;
      t = moment(t).add(duration).valueOf()
    ) {
      scores.push(this.getScore(t));
    }
    return scores;
  }

  getAverageScoreForDate(date) {
    return this.getAverageScoreForInterval(
      moment(date).startOf('date').valueOf(),
      moment(date).endOf('date').valueOf()
    );
  }

  getAverageScoreForInterval(startTime, endTime, interval = 'PT1H') {
    const scores = this.getScoresForInterval(startTime, endTime, interval);
    return safeAverage(scores.map(s => s.score));
  }
}
