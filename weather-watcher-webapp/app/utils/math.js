/**
 * do a linear interpolation between two timestamped values.
 *
 * @param {Object} low - the lower timestamped value.
 * @param {number} low.time - timestamp as ms since unix epoch
 * @param {number} low.value - value at that time
 * @param {Object} high - the higher timestamped value.
 * @param {number} high.time - timestamp as ms since unix epoch
 * @param {number} high.value - value at that time
 * @param {number} timestamp - timestamp
 * @returns {number} the interpolated value
 */
export function interpolateTimestampedValues(
  {time: lowTime, value: lowValue},
  {time: highTime, value: highValue},
  timestamp
) {
  return (
    lowValue +
    (timestamp - lowTime) / (highTime - lowTime) * (highValue - lowValue)
  );
}

function isNumber(n) {
  return !isNaN(n) && n !== null;
}

/**
 * Safely generate an average of a sequence of (maybe) numbers.
 * ignores values in the sequence that are not numbers, and returns 0 if
 * there are no numbers in the sequence.
 *
 * @param {Array<number>} nums - the numbers to average
 * @returns the average of the given numbers
 */
export function safeAverage(nums) {
  let s = 0;
  let count = 0;
  nums.forEach(n => {
    if (isNumber(n)) {
      s += n;
      count++;
    }
  });
  if (count === 0) {
    return 0;
  }
  return s / count;
}

/**
 * Safely compute the minimum of a sequence of (maybe) numbers.
 * ignores values in the sequence that are not numbers, and returns null if
 * there are no numbers in the sequence.
 *
 * @param {Array<number>} nums - the numbers to get the min of
 * @returns the minimum of the given numbers
 */
export function safeMin(nums) {
  let min = null;
  nums.forEach(n => {
    if (isNumber(n) && (n < min || min === null)) {
      min = n;
    }
  });
  return min;
}

/**
 * Safely compute the maximum of a sequence of (maybe) numbers.
 * ignores values in the sequence that are not numbers, and returns null if
 * there are no numbers in the sequence.
 *
 * @param {Array<number>} nums - the numbers to get the max of
 * @returns the maximum of the given numbers
 */
export function safeMax(nums) {
  let max = null;
  nums.forEach(n => {
    if (isNumber(n) && (n > max || max === null)) {
      max = n;
    }
  });
  return max;
}

/**
 * Return the value within the given time series at the given time. If no data point
 * exists at that exact time, one will be interpolated between the two nearest values.
 *
 * @param {Array<{time: number, value: number}>} timeSeries - the timeSeries to search. Must be pre-sorted.
 * @param {number} timestamp - the timestamp to return a value for
 * @return ?number - the value at the given time, or null if the time is out of range.
 */
export function getTimeSeriesValue(timeSeries, timestamp) {
  if (typeof timestamp === 'string') {
    timestamp = new Date(timestamp);
  }
  if (timestamp instanceof Date) {
    timestamp = timestamp.getTime();
  }
  let mid, cmp;

  let low = 0,
    high = timeSeries.length - 1;

  const comparator = ({time: candidate}, timestampStr) =>
    (candidate < timestampStr && -1) || (candidate > timestampStr && 1) || 0;

  while (low <= high) {
    /* Note that "(low + high) >>> 1" may overflow, and results in a typecast
     * to double (which gives the wrong results). */
    mid = low + ((high - low) >> 1);
    cmp = +comparator(timeSeries[mid], timestamp, mid, timeSeries);

    /* Too low. */
    if (cmp < 0.0) {
      low = mid + 1;
    } else if (cmp > 0.0) {
      /* Too high. */
      high = mid - 1;
    } else {
      /* Key found. */
      return timeSeries[mid].value;
    }
  }

  if (!timeSeries[high] || !timeSeries[low]) {
    return null;
  }
  return interpolateTimestampedValues(
    timeSeries[high],
    timeSeries[low],
    timestamp
  );
}

export class InterpolatedSequence {
  constructor(timeSeries) {
    this.timeSeries = timeSeries;
  }

  interpolate(time) {
    return getTimeSeriesValue(this.timeSeries, new Date(time).getTime());
  }
}

export function round(num, numDigits = 0) {
  const factor = 10 ** numDigits;
  return Math.round(num * factor) / factor;
}

export function sum(nums) {
  return nums.reduce((a, b) => a + b, 0);
}
