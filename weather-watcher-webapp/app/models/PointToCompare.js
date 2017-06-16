import {Record} from 'immutable';
const PointToCompareRecord = Record({
  name: 'Untitled Point',
  latitude: 0,
  longitude: 0,
});

export default class PointToCompare extends PointToCompareRecord {
  setName(name) {
    return this.set('name', name);
  }

  setLatitude(latitude) {
    return this.set('latitude', latitude);
  }

  setLongitude(longitude) {
    return this.set('longitude', longitude);
  }
}
