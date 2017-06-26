import {getTimeSeriesValue} from 'app/utils/math';

export class InterpolatedGridForecast {
  constructor(noaaGridForecast) {
    this.timeSeries = {};
    for (const prop in noaaGridForecast.properties) {
      if (noaaGridForecast.properties[prop].values) {
        this.timeSeries[prop] = noaaGridForecast.properties[prop].values.map(({
          validTime,
          value,
        }) => {
          const [timestamp, durationStr] = validTime.split('/');
          return {
            value,
            time: new Date(timestamp).getTime(),
            duration: durationStr,
          };
        });
      }
    }
    this.interpolators = {};
  }

  getInterpolator(propName) {
    if (!this.timeSeries[propName] || this.timeSeries[propName].length === 0) {
      return null;
    }
    let interpolator = this.interpolators[propName];
    if (!interpolator) {
      this.interpolators[propName] = aTime =>
        getTimeSeriesValue(
          this.timeSeries[propName],
          new Date(aTime).getTime()
        );
      interpolator = this.interpolators[propName];
    }
    return interpolator;
  }

  getValue(propName, time) {
    const interpolate = this.getInterpolator(propName);
    if (!interpolate) {
      return null;
    }
    return interpolate(time);
  }
}
