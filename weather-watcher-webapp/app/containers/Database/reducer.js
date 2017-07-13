/*
 *
 * Database reducer
 *
 */

import {fromJS, OrderedMap} from 'immutable';
import {ComparisonProps} from 'app/propTypes';
import {
  FETCH_NOAA_POINT,
  RECEIVE_NOAA_POINT,
  FETCH_NOAA_FORECAST,
  RECEIVE_NOAA_FORECAST,
  CREATE_COMPARISON_POINT,
  UPDATE_COMPARISON_POINT,
  CREATE_COMPARISON,
  UPDATE_COMPARISON,
} from './constants';

export const initialState = fromJS({
  fetches: OrderedMap(),
  noaaPoints: OrderedMap(),
  noaaGridForecasts: OrderedMap(),
  noaaDailyForecasts: OrderedMap(),
  noaaHourlyForecasts: OrderedMap(),
  comparisonPoints: OrderedMap({
    '83970c65-f81e-4d41-a5b3-4ca678b2841c': {
      id: '83970c65-f81e-4d41-a5b3-4ca678b2841c',
      name: 'Mount Rainier',
      latitude: 46.8523,
      longitude: -121.7603,
    },
    '29d94079-a07e-41be-9fc9-bbbe0ba26518': {
      id: '29d94079-a07e-41be-9fc9-bbbe0ba26518',
      name: 'Mount Adams',
      latitude: 46.2024,
      longitude: -121.491,
    },
    'a2ef02e3-e304-4e30-98cb-4a4107929c2d': {
      id: 'a2ef02e3-e304-4e30-98cb-4a4107929c2d',
      name: 'Mount Baker',
      latitude: 48.774,
      longitude: -121.8196,
    },
    '8624cdd8-c965-45fe-9842-d5e1f801d506': {
      id: '8624cdd8-c965-45fe-9842-d5e1f801d506',
      name: 'Mount Stuart',
      latitude: 47.4751,
      longitude: -120.9031,
    },
    'f860614d-292d-4f8e-a5a9-e4fb2b466191': {
      id: 'f860614d-292d-4f8e-a5a9-e4fb2b466191',
      name: 'Glacier Peak',
      latitude: 48.1119,
      longitude: -121.1132,
    },
    '651a2cb1-28b6-461f-940e-0298d32c687c': {
      id: '651a2cb1-28b6-461f-940e-0298d32c687c',
      name: 'Cathedral Peak',
      latitude: 48.9901,
      longitude: -120.1887,
    },
    '97915cd9-8b28-4394-b7f6-b29d9d390c3f': {
      id: '97915cd9-8b28-4394-b7f6-b29d9d390c3f',
      name: 'Mount Saint Helens',
      latitude: 46.1914,
      longitude: -122.1956,
    },
    '2b3a7971-5e02-4985-b53c-6e3e0474f786': {
      id: '2b3a7971-5e02-4985-b53c-6e3e0474f786',
      name: 'Mount Olympus',
      latitude: 47.7998,
      longitude: -123.7066,
    },
    'f69be19d-70d6-42cd-91b4-4101f2df7873': {
      id: 'f69be19d-70d6-42cd-91b4-4101f2df7873',
      name: 'Mount Erie',
      latitude: 48.4537,
      longitude: -122.6254,
    },
    '7d087601-e370-4448-a0ac-fd99f1dd614f': {
      id: '7d087601-e370-4448-a0ac-fd99f1dd614f',
      name: 'Washington Pass',
      latitude: 48.5237,
      longitude: -120.6545,
    },
    '57b4547c-d184-4f42-b355-5ad6f2adcbc9': {
      id: '57b4547c-d184-4f42-b355-5ad6f2adcbc9',
      name: 'Darrington',
      latitude: 48.2554,
      longitude: -121.6015,
    },
    'fb051206-12ea-40ac-afda-9df37012c6ef': {
      id: 'fb051206-12ea-40ac-afda-9df37012c6ef',
      name: 'Index',
      latitude: 47.8207,
      longitude: -121.5551,
    },
    '4d668b62-bf39-45b2-97b4-8ca94e283102': {
      id: '4d668b62-bf39-45b2-97b4-8ca94e283102',
      name: 'Leavenworth',
      latitude: 47.5962,
      longitude: -120.6615,
    },
    '41a9e45e-3201-4f6b-8680-e17879ca7305': {
      id: '41a9e45e-3201-4f6b-8680-e17879ca7305',
      name: 'Vantage',
      latitude: 46.9454,
      longitude: -119.9873,
    },
    'e00bef03-20f3-4463-bd49-a2ece0bed60f': {
      id: 'e00bef03-20f3-4463-bd49-a2ece0bed60f',
      name: 'Tieton',
      latitude: 46.7021,
      longitude: -120.7554,
    },
    '32084ed0-70b8-4be8-a3f1-c2f9c48f8f68': {
      id: '32084ed0-70b8-4be8-a3f1-c2f9c48f8f68',
      name: 'Banks Lake',
      latitude: 47.814,
      longitude: -119.1821,
    },
    '76fd0060-926d-4c3f-bafb-a92ef91168d9': {
      id: '76fd0060-926d-4c3f-bafb-a92ef91168d9',
      name: 'Barlow Pass',
      latitude: 48.0265,
      longitude: -121.444,
    },
    'e7345e69-c5a5-4409-85f4-6a87f8811643': {
      id: 'e7345e69-c5a5-4409-85f4-6a87f8811643',
      name: 'Stevens Pass',
      latitude: 47.7462,
      longitude: -121.0859,
    },
    '80c92172-4131-44b6-90bf-c5f647dcea7c': {
      id: '80c92172-4131-44b6-90bf-c5f647dcea7c',
      name: 'Snoqualmie Pass',
      latitude: 47.3923,
      longitude: -121.4001,
    },
    '0101a1c1-d21d-4eb7-832b-418321528d95': {
      id: '0101a1c1-d21d-4eb7-832b-418321528d95',
      name: 'Washington Pass',
      latitude: 48.5237,
      longitude: -120.6545,
    },
    'e99cfb2c-37f4-4743-a76a-b19ade1830d7': {
      id: 'e99cfb2c-37f4-4743-a76a-b19ade1830d7',
      name: 'White Pass',
      latitude: 46.5059,
      longitude: -121.7235,
    },
  }),
  comparisons: OrderedMap({
    'wa-climb-mountains': {
      name: 'Washington Mountains',
      id: 'wa-climb-mountains',
      comparisonPointIds: [
        '83970c65-f81e-4d41-a5b3-4ca678b2841c',
        '29d94079-a07e-41be-9fc9-bbbe0ba26518',
        'a2ef02e3-e304-4e30-98cb-4a4107929c2d',
        '8624cdd8-c965-45fe-9842-d5e1f801d506',
        'f860614d-292d-4f8e-a5a9-e4fb2b466191',
        '651a2cb1-28b6-461f-940e-0298d32c687c',
        '97915cd9-8b28-4394-b7f6-b29d9d390c3f',
        '2b3a7971-5e02-4985-b53c-6e3e0474f786',
      ],
    },
    'wa-climb-crags': {
      name: 'Washington Crags',
      id: 'wa-climb-crags',
      comparisonPointIds: [
        'f69be19d-70d6-42cd-91b4-4101f2df7873',
        '7d087601-e370-4448-a0ac-fd99f1dd614f',
        '57b4547c-d184-4f42-b355-5ad6f2adcbc9',
        'fb051206-12ea-40ac-afda-9df37012c6ef',
        '4d668b62-bf39-45b2-97b4-8ca94e283102',
        '41a9e45e-3201-4f6b-8680-e17879ca7305',
        'e00bef03-20f3-4463-bd49-a2ece0bed60f',
        '32084ed0-70b8-4be8-a3f1-c2f9c48f8f68',
      ],
    },
    'wa-climb-passes': {
      name: 'Washington Passes',
      id: 'wa-climb-passes',
      comparisonPointIds: [
        '76fd0060-926d-4c3f-bafb-a92ef91168d9',
        'e7345e69-c5a5-4409-85f4-6a87f8811643',
        '80c92172-4131-44b6-90bf-c5f647dcea7c',
        '0101a1c1-d21d-4eb7-832b-418321528d95',
        'e99cfb2c-37f4-4743-a76a-b19ade1830d7',
      ],
    },
  }),
});

function databaseReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_NOAA_POINT:
      return state.setIn(
        ['fetches', `noaaPoint-${action.latitude},${action.longitude}`],
        true
      );
    case FETCH_NOAA_FORECAST:
      return state.setIn(['fetches', action.forecastId], true);
    case RECEIVE_NOAA_POINT:
      return state
        .setIn(['noaaPoints', action.noaaPoint.id], action.noaaPoint)
        .deleteIn([
          'fetches',
          `noaaPoint-${action.latitude},${action.longitude}`,
        ]);
    case RECEIVE_NOAA_FORECAST: {
      const key = {
        hourly: 'noaaHourlyForecasts',
        daily: 'noaaDailyForecasts',
        grid: 'noaaGridForecasts',
      }[action.forecastType];
      return state
        .setIn(
          [
            key,
            action.forecastId,
            action.forecast.properties.updateTime ||
              action.forecast.properties.updated,
          ],
          action.forecast
        )
        .deleteIn(['fetches', action.forecastId]);
    }
    case UPDATE_COMPARISON_POINT:
      return state.updateIn(
        ['comparisonPoints', action.comparisonPoint.id],
        point => ({...point, ...action.comparisonPoint})
      );
    case CREATE_COMPARISON_POINT:
      return state.setIn(
        ['comparisonPoints', action.comparisonPoint.id],
        action.comparisonPoint
      );
    case UPDATE_COMPARISON: {
      const update = {};
      Object.keys(ComparisonProps).forEach(key => {
        update[key] = action.comparison[key];
      });
      return state.updateIn(
        ['comparisons', action.comparison.id],
        comparison => ({...comparison, ...update})
      );
    }
    case CREATE_COMPARISON:
      return state.setIn(
        ['comparisons', action.comparison.id],
        action.comparison
      );
    default:
      return state;
  }
}

export default databaseReducer;
