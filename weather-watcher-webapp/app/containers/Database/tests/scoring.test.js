import {InterpolatedGridForecast, findValue, optimizeValues} from '../scoring';
import sampleNOAAGridForecast from './sampleNOAAGridForecast.json';

describe('InterpolatedGridForecast', () => {
  const grid = new InterpolatedGridForecast({
    properties: {
      someOtherProp: '',
      temperature: {
        values: [
          {
            validTime: '2017-06-16T09:00:00+00:00/PT2H',
            value: 12,
          },
          {
            validTime: '2017-06-16T11:00:00+00:00/PT3H',
            value: 13,
          },
          {
            validTime: '2017-06-16T14:00:00+00:00/PT1H',
            value: 13,
          },
          {
            validTime: '2017-06-16T15:00:00+00:00/PT1H',
            value: 14,
          },
          {
            validTime: '2017-06-16T16:00:00+00:00/PT1H',
            value: 15,
          },
        ],
      },
    },
  });

  it('extracts out a set of timeSeries data for each property', () => {
    expect(Object.keys(grid.timeSeries)).toEqual(['temperature']);
    expect(grid.timeSeries['temperature']).toEqual({
      timeSeries: [
        {time: 1497603600000, value: 12},
        {time: 1497610800000, value: 13},
        {time: 1497621600000, value: 13},
        {time: 1497625200000, value: 14},
        {time: 1497628800000, value: 15},
      ],
    });
  });

  describe('getValue', () => {
    it('returns the exact value when given a time where a data point exists', () => {
      expect(
        grid.getValue('temperature', new Date('2017-06-16T16:00:00+00:00'))
      ).toEqual(15);
    });

    it('interpolates between values ehen given a time where a data point does not exist', () => {
      expect(
        grid.getValue('temperature', new Date('2017-06-16T15:30:00+00:00'))
      ).toEqual(14.5);
    });

    it('returns null when asking for a value a non-existent time series', () => {
      expect(
        grid.getValue('foobar', new Date('2017-06-16T15:30:00+00:00'))
      ).toEqual(null);
    });

    it('returns null when asking for a value outside the range of the time series', () => {
      expect(
        grid.getValue('temperature', new Date('2017-05-16T15:30:00+00:00'))
      ).toEqual(null);
    });
  });
});
