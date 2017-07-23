/* eslint-disable no-await-in-loop, no-console */

import admin from 'firebase-admin';
import {NOAAPoint} from './noaa';

const functions = require('firebase-functions');
const PubSub = require('@google-cloud/pubsub');

admin.initializeApp(functions.config().firebase);
const db = admin.database();
const pubsubClient = PubSub({
  projectId: 'weather-watcher-170701',
});

/**
 * Fetches the noaa point for the given comparison point object from firebase. If no
 * noaa point has been stored in firebase yet, then a new one is fetched from the noaa API and
 * stored before being returned.

 * @param {Object} comparisonPoint - the comparison point for which to fetch the noaa point.
 * @returns {Object}
 * @returns {NOAAPoint} .noaaPoint - the NOAAPoint object
 * @returns {Object} .comparisonPoint - a new comparison point object updated with the noaaPoint.
 */
async function fetchNOAAPointForComparisonPoint(comparisonPoint) {
  if (comparisonPoint.noaaPointId) {
    const noaaPointSnapshot = await db
      .ref(NOAAPoint.getFirebasePath(comparisonPoint.noaaPointId))
      .once('value');
    const data = noaaPointSnapshot.val();
    if (data) {
      return {noaaPoint: new NOAAPoint({data}), comparisonPoint};
    }
  }
  // either firebase is missing the data, or we don't even have a noaa point id, in which case
  // we need to fetch from the noaa api.
  const {latitude, longitude} = comparisonPoint;
  const noaaPoint = await NOAAPoint.fetch({latitude, longitude});
  await db.ref(noaaPoint.getFirebasePath()).set(noaaPoint.data);
  comparisonPoint = {
    ...comparisonPoint,
    noaaPointId: noaaPoint.getFirebaseId(),
  };
  await db
    .ref(`comparisonPoints/${comparisonPoint.id}/noaaPointId`)
    .set(comparisonPoint.noaaPointId);
  return {
    noaaPoint,
    comparisonPoint,
  };
}

export const updateComparisonPoint = functions.pubsub
  .topic('comparison-point-update')
  .onPublish(async event => {
    const {comparisonPoint} = event.data.json;

    console.log('Updating comparison point', comparisonPoint.id);
    const {noaaPoint} = await fetchNOAAPointForComparisonPoint(comparisonPoint);

    const dailyForecast = await noaaPoint.fetchDailyForecast();
    await db.ref(dailyForecast.getFirebasePath()).set(dailyForecast.data);
    console.log('Updated daily forecast', dailyForecast.getFirebasePath());

    const hourlyForecast = await noaaPoint.fetchHourlyForecast();
    await db.ref(hourlyForecast.getFirebasePath()).set(hourlyForecast.data);
    console.log('Updated hourly forecast', hourlyForecast.getFirebasePath());

    const gridForecast = await noaaPoint.fetchGridDataForecast();
    await db.ref(gridForecast.getFirebasePath()).set(gridForecast.data);
    console.log('Updated grid forecast', gridForecast.getFirebasePath());
  });

export const hourlyJob = functions.pubsub
  .topic('hourly-tick')
  .onPublish(async () => {
    console.log('Fetching comparison points to update');
    const snapshot = await db.ref('comparisonPoints').once('value');

    // The name for the new topic
    const comparisonPointUpdateTopic = pubsubClient.topic(
      'comparison-point-update'
    );

    const comparisonPoints = snapshot.val();
    console.log(
      'kicking off',
      Object.keys(comparisonPoints).length,
      'update jobs'
    );
    comparisonPointUpdateTopic.publish(
      Object.keys(comparisonPoints).map(key => ({
        comparisonPoint: comparisonPoints[key],
      }))
    );
  });
