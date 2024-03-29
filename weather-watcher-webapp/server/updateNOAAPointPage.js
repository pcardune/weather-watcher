import path from 'path';
import admin from 'firebase-admin';
import fs from 'fs';
import {NOAAPoint} from './cloud/noaa';
import {updateNOAAPoint, init} from './cloud/functions';

let serviceAccount;
let firebase;
if (fs.existsSync(path.resolve(__dirname, '../serviceAccountKey.json'))) {
  serviceAccount = require('../serviceAccountKey.json');
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://weather-watcher-170701.firebaseio.com',
  });
} else {
  console.warn("no serviceAccountKey. Cloud functions won't work.");
}

export default async (req, res) => {
  init(firebase.database());
  const snapshot = await firebase
    .database()
    .ref(NOAAPoint.getFirebasePath(req.params.noaaPointId))
    .once('value');
  try {
    await updateNOAAPoint(new NOAAPoint({data: snapshot.val()}));
  } catch (e) {
    console.error(e);
    throw e;
  }
  res.send('all done...');
};
