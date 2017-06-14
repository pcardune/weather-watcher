import Storage from '@google-cloud/storage';
import {Readable} from 'stream';
import fse from 'fs-extra';
import debug from 'debug';

const logDebug = debug('storage');

const PROJECT_ID = 'weather-watcher-170701';
const BUCKET_NAME = 'weather-watcher-storage';
const gcs = Storage({
  projectId: PROJECT_ID,
});

function getBucket() {
  return gcs.bucket(BUCKET_NAME);
}

function getFilenameForNOAAGridDataForecast(noaaGridDataForecast) {
  const data = noaaGridDataForecast.data;
  const props = data.properties;
  return `NOAAGridDataForecast/${props.gridId}/${props.gridX}/${props.gridY}/${props.validTimes}.json`;
}

export async function saveNOAAGridDataForecast(noaaGridDataForecast) {
  const dir = await fse.mkdtemp('/tmp/weather-watcher-');
  const inputPath = `${dir}/grid-data.json`;
  await fse.writeJson(inputPath, noaaGridDataForecast.data);
  const destination = getFilenameForNOAAGridDataForecast(noaaGridDataForecast);
  logDebug('Uploading', destination);
  const [file] = await getBucket().upload(inputPath, {
    gzip: true,
    destination,
  });
  return file;
}
