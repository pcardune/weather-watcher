import {InterpolatedScoreFunction, InterpolatedGridForecast} from '../scoring';
import sampleNOAAGridForecast from './sampleNOAAGridForecast.json';

describe('InterpolatedGridForecast', () => {
  const grid = new InterpolatedGridForecast({
    properties: {
      someOtherProp: '',
      temperature: {
        values: [
          {
            validTime: '2017-06-16T00:00:00+00:00/PT2H',
            value: 5,
          },
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
          {
            validTime: '2017-06-16T23:00:00+00:00/PT1H',
            value: 7,
          },
        ],
      },
    },
  });

  it('extracts out a set of timeSeries data for each property', () => {
    expect(Object.keys(grid.timeSeries)).toEqual(['temperature']);
    expect(grid.timeSeries.temperature).toEqual({
      timeSeries: [
        {time: 1497571200000, value: 5},
        {time: 1497603600000, value: 12},
        {time: 1497610800000, value: 13},
        {time: 1497621600000, value: 13},
        {time: 1497625200000, value: 14},
        {time: 1497628800000, value: 15},
        {time: 1497654000000, value: 7},
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

    it('returns null when asking for a value of a non-existent time series', () => {
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

  describe('getValuesForDate', () => {
    it('returns a list of values covering the entire day specified', () => {
      expect(
        grid.getValuesForDate(
          'temperature',
          new Date('2017-06-16T16:00:00+00:00')
        )
      ).toEqual([
        10.444444444444445,
        11.222222222222221,
        12,
        12.5,
        13,
        13,
        13,
        13,
        14,
        15,
        13.857142857142858,
        12.714285714285715,
        11.571428571428571,
        10.428571428571429,
        9.285714285714285,
        8.142857142857142,
        7,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]);
    });
  });
});

describe('InterpolatedScoreFunction', () => {
  const score = new InterpolatedScoreFunction({
    interpolatedGridForecast: new InterpolatedGridForecast(
      sampleNOAAGridForecast
    ),
    scoreConfig: {
      idealTemp: 18.3,
    },
  });

  describe('getScore', () => {
    it('returns the score at the given time', () => {
      expect(
        score.getScore(new Date('2017-06-16T14:00:00+00:00').getTime())
      ).toEqual({score: 60, time: 1497621600000});
    });
  });

  describe('getAverageScoreForDate', () => {
    it('returns the average of the scores for the given date', () => {
      expect(
        score.getAverageScoreForDate(
          new Date('2017-06-16T14:00:00+00:00').getTime()
        )
      ).toEqual(70.58333333333333);
    });
  });

  describe('getScoresForDate', () => {
    it('returns a sequence of scores for the given date', () => {
      expect(
        score.getScoresForDate(new Date('2017-06-16T14:00:00+00:00').getTime())
      ).toEqual([
        {score: 63, time: 1497596400000},
        {score: 63, time: 1497600000000},
        {score: 63, time: 1497603600000},
        {score: 61, time: 1497607200000},
        {score: 60, time: 1497610800000},
        {score: 59, time: 1497614400000},
        {score: 60, time: 1497618000000},
        {score: 60, time: 1497621600000},
        {score: 61, time: 1497625200000},
        {score: 62, time: 1497628800000},
        {score: 63, time: 1497632400000},
        {score: 64, time: 1497636000000},
        {score: 70, time: 1497639600000},
        {score: 75, time: 1497643200000},
        {score: 80, time: 1497646800000},
        {score: 80, time: 1497650400000},
        {score: 80, time: 1497654000000},
        {score: 82, time: 1497657600000},
        {score: 83, time: 1497661200000},
        {score: 83, time: 1497664800000},
        {score: 81, time: 1497668400000},
        {score: 80, time: 1497672000000},
        {score: 80, time: 1497675600000},
        {score: 81, time: 1497679200000},
      ]);
    });
  });
});
