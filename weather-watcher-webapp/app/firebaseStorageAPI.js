import immutableStorage from 'redux-firebase-mirror/dist/immutableStorage';

let requestedPaths, recording;

export default {
  ...immutableStorage,
  getKeysAtPath(mirror, path) {
    if (recording) {
      requestedPaths.add(path);
    }
    return immutableStorage.getKeysAtPath(mirror, path);
  },
  getValueAtPath(mirror, path) {
    if (recording) {
      requestedPaths.add(path);
    }
    return immutableStorage.getValueAtPath(mirror, path);
  },
  startRecording() {
    recording = true;
    requestedPaths = new Set();
  },
  stopRecording() {
    recording = false;
    return requestedPaths;
  },
};
