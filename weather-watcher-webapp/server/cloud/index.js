/* eslint-disable no-await-in-loop, no-console */

import admin from 'firebase-admin';
import {init, updateComparisonPointForecasts} from './functions';
const functions = require('firebase-functions');
const PubSub = require('@google-cloud/pubsub');

admin.initializeApp(functions.config().firebase);
const db = admin.database();
init(db);
const pubsubClient = PubSub({
  projectId: 'weather-watcher-170701',
});

export const updateComparisonPoint = functions.pubsub
  .topic('comparison-point-update')
  .onPublish(async event => {
    await updateComparisonPointForecasts(event.data.json.comparisonPoint);
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

export const onCreateComparisonPoint = functions.database
  .ref('/comparisonPoints/{comparisonPointId}')
  .onCreate(async event => {
    await updateComparisonPointForecasts(event.data.val());
  });
