import {NOAAPoint} from 'weather-watcher-cloud-functions/src/noaa';
import {
  updateNOAAPoint,
  init,
} from 'weather-watcher-cloud-functions/src/functions';
import admin from 'firebase-admin';

const serviceAccount = require('../serviceAccountKey.json');
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://weather-watcher-170701.firebaseio.com',
});

export default async (req, res) => {
  init(firebase.database());
  console.log('updating noaaPoint', req.params.noaaPointId);
  const snapshot = await firebase
    .database()
    .ref(NOAAPoint.getFirebasePath(req.params.noaaPointId))
    .once('value');
  console.log('starting actual update with', snapshot.val());
  await updateNOAAPoint(new NOAAPoint({data: snapshot.val()}));
  res.send('all done...');
};
