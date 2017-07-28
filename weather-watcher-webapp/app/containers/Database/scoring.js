import SunCalc from 'suncalc';
import convert from 'convert-units';
import moment from 'moment-mini';
import {InterpolatedSequence, safeAverage, sum} from 'app/utils/math';
import {SCORE_MULTIPLIERS} from 'app/constants';

export class InterpolatedGridForecast {
  constructor(noaaGridForecast) {
    this.timeSeries = {};
    this.noaaGridForecast = noaaGridForecast;
    if (noaaGridForecast) {
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

function scoreForRange(range, value) {
  if (value < range[0]) {
    return SCORE_MULTIPLIERS.red;
  } else if (value < range[1]) {
    return (
      SCORE_MULTIPLIERS.yellow -
      (range[1] - value) /
        (range[1] - range[0]) *
        (SCORE_MULTIPLIERS.yellow - SCORE_MULTIPLIERS.red)
    );
  } else if (value < range[2]) {
    return (
      SCORE_MULTIPLIERS.green -
      (range[2] - value) /
        (range[2] - range[1]) *
        (SCORE_MULTIPLIERS.green - SCORE_MULTIPLIERS.yellow)
    );
  } else if (value < range[3]) {
    return (
      SCORE_MULTIPLIERS.green -
      (value - range[2]) /
        (range[3] - range[2]) *
        (SCORE_MULTIPLIERS.green - SCORE_MULTIPLIERS.yellow)
    );
  } else if (value < range[4]) {
    return (
      SCORE_MULTIPLIERS.yellow -
      (value - range[3]) /
        (range[4] - range[3]) *
        (SCORE_MULTIPLIERS.yellow - SCORE_MULTIPLIERS.red)
    );
  }
  return SCORE_MULTIPLIERS.red;
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

  const scoreComponents = {
    temp: scoreForRange(scoreConfig.tempRange, temp),
    wind: scoreForRange(scoreConfig.windRange, windSpeed),
    precip: scoreForRange(scoreConfig.precipRange, precip),
    precipQuantity: scoreForRange(scoreConfig.quantityRange, precipQuantity),
  };

  const components = Object.values(scoreComponents);
  const score =
    sum(components) / components.length / SCORE_MULTIPLIERS.green * 100;
  return {score, scoreComponents, time};
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
    if (!this.grid.noaaGridForecast) {
      return [];
    }
    const [
      longitude,
      latitude,
    ] = this.grid.noaaGridForecast.geometry.coordinates[0][0];
    const times = SunCalc.getTimes(date, latitude, longitude);
    return this.getScoresForInterval(
      moment(date).set('hour', times.sunrise.getHours()).valueOf(),
      moment(date).set('hour', times.sunset.getHours()).valueOf(),
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
    if (!this.grid.noaaGridForecast) {
      return 0;
    }
    const [
      longitude,
      latitude,
    ] = this.grid.noaaGridForecast.geometry.coordinates[0][0];
    const times = SunCalc.getTimes(
      moment(date).startOf('date').valueOf(),
      latitude,
      longitude
    );
    return this.getAverageScoreForInterval(
      moment(date).set('hour', times.sunrise.getHours()).valueOf(),
      moment(date).set('hour', times.sunset.getHours()).valueOf()
    );
  }

  getAverageScoreForInterval(startTime, endTime, interval = 'PT1H') {
    const scores = this.getScoresForInterval(startTime, endTime, interval);
    return safeAverage(scores.map(s => s.score));
  }
}
