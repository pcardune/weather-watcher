import queryString from 'query-string';
import isEqual from 'lodash.isequal';
import atob from 'atob';
import btoa from 'btoa';
import {DEFAULT_SCORE_CONFIG} from 'app/constants';

/**
 * Returns a json object that has been encoded as a bade64 string in a query string param
 *
 * @param {Object} location - A location object from react router
 * @param {string} paramName - The name of the parameter in the query string
 * @param defaultValue - The value to return if the parameter is not present or is malformed
 */
export function getJSONFromQueryParam({search}, paramName, defaultValue) {
  let value = defaultValue;
  if (search) {
    const query = queryString.parse(search);
    if (query[paramName]) {
      try {
        value = JSON.parse(atob(query[paramName]));
      } catch (e) {
        console.warn('failed to parse json from query param', query[paramName]);
        // failed to parse json from query string, leave as default value
      }
    }
  }
  return value;
}

/**
 * returns the score config that is embedded in a url location
 *
 * @param {Object} location - a location object from react router
 * @returns {Object} the scoreConfig object
 */
export function getScoreConfigFromLocation(location) {
  return getJSONFromQueryParam(location, 'scoreConfig', DEFAULT_SCORE_CONFIG);
}

/**
 * Returns a path with the given score config embedded in it.
 *
 * @param {Object} location - a location object from react router
 * @param {Object} scoreConfig - the score config object to embed
 * @returns {string} the location's path with the given score config embedded in it.
 */
export function getPathWithScoreConfig(location, scoreConfig) {
  let query = {};
  if (location.search) {
    query = queryString.parse(location.search);
  }
  if (isEqual(scoreConfig, DEFAULT_SCORE_CONFIG)) {
    delete query.scoreConfig;
  } else {
    query.scoreConfig = btoa(JSON.stringify(scoreConfig));
  }
  const search = queryString.stringify(query);
  if (search) {
    return `${location.pathname}?${queryString.stringify(query)}`;
  }
  return location.pathname;
}
