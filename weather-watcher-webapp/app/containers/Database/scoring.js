import SunCalc from 'suncalc';
import convert from 'convert-units';
import moment from 'moment-mini';
import memoize from 'lodash.memoize';
import {InterpolatedSequence, safeAverage, sum, mode} from 'app/utils/math';
import {SCORE_MULTIPLIERS, SCORE_COMPONENTS} from 'app/constants';

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

    const duration = moment.duration(interval).asMilliseconds();
    for (let t = startTime; t < endTime; t += duration) {
      values.push(this.getValue(propName, t));
    }
    return values;
  }
}

const HIGH = 'high';
const LOW = 'low';

function scoreForRange(range, value) {
  if (value < range[0]) {
    return [SCORE_MULTIPLIERS.red, LOW];
  } else if (value < range[1]) {
    return [
      SCORE_MULTIPLIERS.yellow -
        (range[1] - value) /
          (range[1] - range[0]) *
          (SCORE_MULTIPLIERS.yellow - SCORE_MULTIPLIERS.red),
      LOW,
    ];
  } else if (value < range[2]) {
    return [
      SCORE_MULTIPLIERS.green -
        (range[2] - value) /
          (range[2] - range[1]) *
          (SCORE_MULTIPLIERS.green - SCORE_MULTIPLIERS.yellow),
      LOW,
    ];
  } else if (value < range[3]) {
    return [
      SCORE_MULTIPLIERS.green -
        (value - range[2]) /
          (range[3] - range[2]) *
          (SCORE_MULTIPLIERS.green - SCORE_MULTIPLIERS.yellow),
      ,
      HIGH,
    ];
  } else if (value < range[4]) {
    return [
      SCORE_MULTIPLIERS.yellow -
        (value - range[3]) /
          (range[4] - range[3]) *
          (SCORE_MULTIPLIERS.yellow - SCORE_MULTIPLIERS.red),
      HIGH,
    ];
  }
  return [SCORE_MULTIPLIERS.red, HIGH];
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

  const [tempScore, tempDescriptor] = scoreForRange(
    scoreConfig.tempRange,
    temp
  );
  const [windScore, windDescriptor] = scoreForRange(
    scoreConfig.windRange,
    windSpeed
  );
  const [precipScore, precipDescriptor] = scoreForRange(
    scoreConfig.precipRange,
    precip
  );
  const [precipQuantityScore, precipQuantityDescriptor] = scoreForRange(
    scoreConfig.quantityRange,
    precipQuantity
  );

  const scoreComponents = {
    temp: tempScore,
    wind: windScore,
    precip: precipScore,
    precipQuantity: precipQuantityScore,
  };

  const descriptorComponents = {
    temp: tempDescriptor,
    wind: windDescriptor,
    precip: precipDescriptor,
    precipQuantity: precipQuantityDescriptor,
  };

  const components = Object.values(scoreComponents);
  const score =
    sum(components) / components.length / SCORE_MULTIPLIERS.green * 100;
  return {
    score,
    scoreComponents,
    descriptorComponents,
    time,
  };
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

    const duration = moment.duration(interval).asMilliseconds();
    for (let t = startTime; t < endTime; t += duration) {
      scores.push(this.getScore(t));
    }
    return scores;
  }

  getAverageScoreForDate = memoize(
    date => {
      if (!this.grid.noaaGridForecast) {
        return {score: 0, scoreComponents: {}, scoreDescriptors: {}};
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
    },
    date => moment(date).startOf('date').valueOf()
  );

  getBadnessForDate(date) {
    const scores = this.getScoresForDate(date);
    const badness = {};
    Object.keys(SCORE_COMPONENTS).forEach(key => {
      badness[key] = {score: Infinity};
    });
    scores.forEach(score => {
      for (const key in score.scoreComponents) {
        if (badness[key] && score.scoreComponents[key] < badness[key].score) {
          badness[key] = {
            score: score.scoreComponents[key],
            descriptor: score.descriptorComponents[key],
          };
        } else {
          badness[key] = {
            score: score.scoreComponents[key],
            descriptor: score.descriptorComponents[key],
          };
        }
      }
    });
    return badness;
  }

  getAverageScoreForInterval(startTime, endTime, interval = 'PT1H') {
    const scores = this.getScoresForInterval(startTime, endTime, interval);
    return {
      score: safeAverage(scores.map(s => s.score)),
      scoreComponents: {
        wind: safeAverage(scores.map(s => s.scoreComponents.wind)),
        temp: safeAverage(scores.map(s => s.scoreComponents.temp)),
        precip: safeAverage(scores.map(s => s.scoreComponents.precip)),
        precipQuantity: safeAverage(
          scores.map(s => s.scoreComponents.precipQuantity)
        ),
      },
      scoreDescriptors: {
        wind: mode(scores.map(s => s.descriptorComponents.wind)),
        temp: mode(scores.map(s => s.descriptorComponents.temp)),
        precip: mode(scores.map(s => s.descriptorComponents.precip)),
        precipQuantity: mode(
          scores.map(s => s.descriptorComponents.precipQuantity)
        ),
      },
    };
  }
}
