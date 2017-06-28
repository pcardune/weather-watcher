import {InterpolatedSequence} from 'app/utils/math';

export class InterpolatedGridForecast {
  constructor(noaaGridForecast) {
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
}
