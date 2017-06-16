import {Record, List, fromJS} from 'immutable';

const ComparisonRecord = Record({
  name: 'Untitled',
  pointsToCompare: List(),
});

export default class Comparison extends ComparisonRecord {
  setName(name) {
    return this.set('name', name);
  }

  addPointToCompare(pointToCompare) {
    return this.set(
      'pointsToCompare',
      this.pointsToCompare.push(pointToCompare)
    );
  }

  removePointToCompare(pointToCompare) {
    return this.set(
      'pointsToCompare',
      this.pointsToCompare.remove(pointToCompare)
    );
  }

  toJSON() {
    return this.toJS();
  }

  static fromJSON(json) {
    return new Comparison(fromJS(json));
  }

  getSortedPointsForDate() {
    return [];
  }
}
