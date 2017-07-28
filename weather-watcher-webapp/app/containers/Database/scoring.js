import {InterpolatedSequence, safeAverage} from 'app/utils/math';
import convert from 'convert-units';
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

function scoreForRange(range, value) {
  const scores = {
    red: 0,
    yellow: 2,
    green: 3,
  };

  if (value < range[0]) {
    return scores.red;
  } else if (value < range[1]) {
    return (
      scores.yellow -
      (range[1] - value) / (range[1] - range[0]) * (scores.yellow - scores.red)
    );
  } else if (value < range[2]) {
    return (
      scores.green -
      (range[2] - value) /
        (range[2] - range[1]) *
        (scores.green - scores.yellow)
    );
  } else if (value < range[3]) {
    return (
      scores.green -
      (value - range[2]) /
        (range[3] - range[2]) *
        (scores.green - scores.yellow)
    );
  } else if (value < range[4]) {
    return (
      scores.yellow -
      (value - range[3]) / (range[4] - range[3]) * (scores.yellow - scores.red)
    );
  }
  return scores.red;
}

function getScoreForTime(grid, time, scoreConfig) {
  const precip = grid.getValue('probabilityOfPrecipitation', time);
  const windSpeed = convert(grid.getValue('windSpeed', time))
    .from('knot')
    .to('m/h');
  const precipQuantity = convert(
    grid.getValue('quantitativePrecipitation', time)
  )
    .from('mm')
    .to('in');
  const temp = convert(grid.getValue('temperature', time)).from('C').to('F');

  const score =
    (scoreForRange(scoreConfig.tempRange, temp) +
      scoreForRange(scoreConfig.windRange, windSpeed) +
      scoreForRange(scoreConfig.precipRange, precip) +
      scoreForRange(scoreConfig.quantityRange, precipQuantity)) *
    10;
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
