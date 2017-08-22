import queryString from 'query-string';
import isEqual from 'lodash.isequal';
import atob from 'atob';
import btoa from 'btoa';
import moment from 'moment-mini';
import {DEFAULT_SCORE_CONFIG} from 'app/constants';

const PARAMS_CONFIG = {
  scoreConfig: {
    convertToString: s => btoa(JSON.stringify(s)),
    convertFromString: s => JSON.parse(atob(s)),
    getDefaultValue: () => DEFAULT_SCORE_CONFIG,
  },
  date: {
    convertToString: d => moment(d).format('YYYY-MM-DD'),
    convertFromString: s => {
      const [year, month, day] = s.split('-');
      return new Date(year, month - 1, day);
    },
    getDefaultValue: () => moment(new Date()).startOf('date').toDate(),
  },
};

export function getQueryParam({search}, paramName, config) {
  config = config || PARAMS_CONFIG[paramName];
  let value = config.getDefaultValue ? config.getDefaultValue() : undefined;
  if (search) {
    const query = queryString.parse(search);
    if (query[paramName]) {
      if (config.convertFromString) {
        try {
          value = config.convertFromString(query[paramName]);
        } catch (e) {
          console.warn('failed to convert from query param', query[paramName]);
        }
      } else {
        value = query[paramName];
      }
    }
  }
  return value;
}

export function getPathWithQueryParams(
  location,
  params = {},
  configs = PARAMS_CONFIG
) {
  let query = {};
  if (location.search) {
    query = queryString.parse(location.search);
  }

  Object.keys(params).forEach(key => {
    const value = params[key];
    const config = configs[key] || {};
    if (config.getDefaultValue && isEqual(value, config.getDefaultValue())) {
      delete query[key];
    } else if (value) {
      query[key] = config.convertToString
        ? config.convertToString(value)
        : value;
      if (query[key] !== undefined && typeof query[key] !== 'string') {
        throw new Error('params must be converted to strings');
      }
    }
  });
  const search = queryString.stringify(query);
  if (search) {
    return `${location.pathname}?${queryString.stringify(query)}`;
  }
  return location.pathname;
}

/**
 * returns the score config that is embedded in a url location
 *
 * @param {Object} location - a location object from react router
 * @returns {Object} the scoreConfig object
 */
export function getScoreConfigFromLocation(location) {
  return getQueryParam(location, 'scoreConfig');
}

/**
 * returns the date that is embedded in a url location
 *
 * @param {Object} location - a location object from react router
 * @returns {Date} a date object
 */
export function getDateFromLocation(location) {
  return getQueryParam(location, 'date');
}

/**
 * Returns a path with the given score config embedded in it.
 *
 * @param {Object} location - a location object from react router
 * @param {Object} scoreConfig - the score config object to embed
 * @returns {string} the location's path with the given score config embedded in it.
 */
export function getPathWithScoreConfigAndDate(location, {scoreConfig, date}) {
  return getPathWithQueryParams(location, {scoreConfig, date});
}
