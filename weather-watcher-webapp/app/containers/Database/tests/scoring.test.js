import {InterpolatedScoreFunction, InterpolatedGridForecast} from '../scoring';
import sampleNOAAGridForecast from './sampleNOAAGridForecast.json';
import {DEFAULT_SCORE_CONFIG} from '../constants';

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
    scoreConfig: DEFAULT_SCORE_CONFIG,
  });

  describe('getScore', () => {
    it('returns the score at the given time', () => {
      expect(
        score.getScore(new Date('2017-06-16T14:00:00+00:00').getTime())
      ).toEqual({
        score: 58.05449636792378,
        scoreComponents: {
          precip: 0.1777777777777776,
          precipQuantity: 2.6666504,
          temp: 2.60000000000001,
          wind: 1.5221113863730666,
        },
        time: 1497621600000,
      });
    });
  });

  describe('getAverageScoreForDate', () => {
    it('returns the average of the scores for the given date', () => {
      expect(
        score.getAverageScoreForDate(
          new Date('2017-06-16T14:00:00+00:00').getTime()
        ).score
      ).toEqual(68.50740829619826);
    });
  });

  describe('getScoresForDate', () => {
    it('returns a sequence of scores for the given date', () => {
      expect(
        score.getScoresForDate(new Date('2017-06-16T14:00:00+00:00').getTime())
      ).toEqual([
        {
          score: 57.8596689399132,
          scoreComponents: {
            precip: 0.2666666666666666,
            precipQuantity: 2.6666504,
            temp: 2.56666666666665,
            wind: 1.4431765394562668,
          },
          time: 1497614400000,
        },
        {
          score: 57.95708265391849,
          scoreComponents: {
            precip: 0.22222222222222232,
            precipQuantity: 2.6666504,
            temp: 2.58333333333333,
            wind: 1.4826439629146666,
          },
          time: 1497618000000,
        },
        {
          score: 58.05449636792378,
          scoreComponents: {
            precip: 0.1777777777777776,
            precipQuantity: 2.6666504,
            temp: 2.60000000000001,
            wind: 1.5221113863730666,
          },
          time: 1497621600000,
        },
        {
          score: 58.42968785970708,
          scoreComponents: {
            precip: 0.1333333333333333,
            precipQuantity: 2.6666504,
            temp: 2.6500000000000496,
            wind: 1.5615788098314667,
          },
          time: 1497625200000,
        },
        {
          score: 58.91451108331852,
          scoreComponents: {
            precip: 0.08888888888888902,
            precipQuantity: 2.6666504,
            temp: 2.7,
            wind: 1.6142020411093334,
          },
          time: 1497628800000,
        },
        {
          score: 59.399334306930704,
          scoreComponents: {
            precip: 0.04444444444444429,
            precipQuantity: 2.6666504,
            temp: 2.75000000000004,
            wind: 1.6668252723872001,
          },
          time: 1497632400000,
        },
        {
          score: 59.88415753054214,
          scoreComponents: {
            precip: 0,
            precipQuantity: 2.6666504,
            temp: 2.79999999999999,
            wind: 1.7194485036650669,
          },
          time: 1497636000000,
        },
        {
          score: 65.20341048320354,
          scoreComponents: {
            precip: 0.24444444444444424,
            precipQuantity: 2.6666504,
            temp: 2.89999999999998,
            wind: 2.01331441354,
          },
          time: 1497639600000,
        },
        {
          score: 71.2749613372609,
          scoreComponents: {
            precip: 0.48888888888888915,
            precipQuantity: 2.6666504,
            temp: 2.9500000000000197,
            wind: 2.4474560715824,
          },
          time: 1497643200000,
        },
        {
          score: 77.34651219131754,
          scoreComponents: {
            precip: 0.7333333333333334,
            precipQuantity: 2.6666504,
            temp: 2.9999999999999702,
            wind: 2.8815977296248,
          },
          time: 1497646800000,
        },
        {
          score: 77.56353030856133,
          scoreComponents: {
            precip: 0.9777777777777776,
            precipQuantity: 2.6666504,
            temp: 2.89999999999998,
            wind: 2.7631954592496,
          },
          time: 1497650400000,
        },
        {
          score: 77.78054842580437,
          scoreComponents: {
            precip: 1.2222222222222223,
            precipQuantity: 2.6666504,
            temp: 2.7999999999999003,
            wind: 2.6447931888744,
          },
          time: 1497654000000,
        },
        {
          score: 79.24756654304839,
          scoreComponents: {
            precip: 1.4666666666666668,
            precipQuantity: 2.6666504,
            temp: 2.84999999999994,
            wind: 2.5263909184992,
          },
          time: 1497657600000,
        },
        {
          score: 79.21384128575318,
          scoreComponents: {
            precip: 1.6333333333333333,
            precipQuantity: 2.7222086666666665,
            temp: 2.89999999999998,
            wind: 2.2501189542904,
          },
          time: 1497661200000,
        },
        {
          score: 79.25276327823127,
          scoreComponents: {
            precip: 1.8,
            precipQuantity: 2.7777669333333335,
            temp: 2.9500000000000197,
            wind: 1.9825646600544,
          },
          time: 1497664800000,
        },
        {
          score: 78.73646014373804,
          scoreComponents: {
            precip: 1.9666666666666666,
            precipQuantity: 2.8333252,
            temp: 2.85000000000003,
            wind: 1.7983833505818667,
          },
          time: 1497668400000,
        },
      ]);
    });
  });
});
