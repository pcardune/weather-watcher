import {
  interpolateTimestampedValues,
  getTimeSeriesValue,
  safeAverage,
} from '../math';

describe('interpolateTimestampedValues', () => {
  it('interpolates between two timestamped valued', () => {
    expect(
      interpolateTimestampedValues(
        {time: 100, value: 10},
        {time: 200, value: 20},
        150
      )
    ).toEqual(15);
  });
});

describe('getTimeSeriesValue', () => {
  const values = [
    {
      time: new Date('2017-06-16T09:00:00+00:00').getTime(),
      value: 12,
    },
    {
      time: new Date('2017-06-16T11:00:00+00:00').getTime(),
      value: 13,
    },
    {
      time: new Date('2017-06-16T14:00:00+00:00').getTime(),
      value: 13,
    },
    {
      time: new Date('2017-06-16T15:00:00+00:00').getTime(),
      value: 14,
    },
    {
      time: new Date('2017-06-16T16:00:00+00:00').getTime(),
      value: 15,
    },
  ];

  it('will find a value in a sorted list of values', () => {
    expect(getTimeSeriesValue(values, '2017-06-16T14:00:00+00:00')).toEqual(13);
    expect(getTimeSeriesValue(values, '2017-06-16T09:00:00+00:00')).toEqual(12);
    expect(getTimeSeriesValue(values, '2017-06-16T16:00:00+00:00')).toEqual(15);
  });

  it('will interpolate between values that are not found', () => {
    expect(getTimeSeriesValue(values, '2017-06-16T15:30:00+00:00')).toEqual(
      14.5
    );
    expect(getTimeSeriesValue(values, '2017-06-16T15:45:00+00:00')).toEqual(
      14.75
    );
    expect(getTimeSeriesValue(values, '2017-06-16T12:30:00+00:00')).toEqual(13);
    expect(getTimeSeriesValue(values, '2017-06-16T10:00:00+00:00')).toEqual(
      12.5
    );
  });

  it('will return null when time is out of range', () => {
    expect(getTimeSeriesValue(values, '2017-06-15T10:00:00+00:00')).toEqual(
      null
    );
    expect(getTimeSeriesValue(values, '2017-06-17T10:00:00+00:00')).toEqual(
      null
    );
  });
});

describe('safeAverage', () => {
  it('computes the average of a sequence of numbers', () => {
    expect(safeAverage([1])).toEqual(1);
    expect(safeAverage([1, 2])).toEqual(1.5);
    expect(safeAverage([1, 2, 3])).toEqual(2);
  });

  it('ignores non-numbers in the sequence', () => {
    expect(safeAverage([1, null, 2, undefined, 'foo', 3])).toEqual(2);
  });

  it('returns 0 for an empty sequence', () => {
    expect(safeAverage([])).toEqual(0);
    expect(safeAverage([null, undefined, 'foo'])).toEqual(0);
  });
});
