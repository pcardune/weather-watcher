import Comparison from '../Comparison';
import PointToCompare from '../PointToCompare';

describe('Comparison', () => {
  let comparison;
  beforeEach(() => {
    comparison = new Comparison();
  });

  it('has a name', () => {
    expect(comparison.name).toEqual('Untitled');
  });

  it('has an empty list of points to compare', () => {
    expect(comparison.pointsToCompare.size).toEqual(0);
  });

  describe('setName', () => {
    it('changes the name of the comparison', () => {
      comparison = comparison.setName('Foo');
      expect(comparison.name).toEqual('Foo');
    });
  });

  describe('addPointToCompare', () => {
    it('adds the given point to compare to the list', () => {
      const pointToCompare = new PointToCompare();
      comparison = comparison.addPointToCompare(pointToCompare);
      expect(comparison.pointsToCompare).toContain(pointToCompare);
    });
  });

  describe('removePointToCompare', () => {
    it('removes the given point to compare from the list', () => {
      const pointToCompare = new PointToCompare();
      comparison = comparison.removePointToCompare(pointToCompare);
      expect(comparison.pointsToCompare).not.toContain(pointToCompare);
    });
  });

  describe('toJSON', () => {
    it('returns a json structure', () => {
      expect(comparison.toJSON()).toEqual({
        name: 'Untitled',
        pointsToCompare: [],
      });
    });
  });

  describe('fromJSON', () => {
    it('returns a new Comparison based on the provided json', () => {
      expect(
        Comparison.fromJSON({
          name: 'Untitled',
          pointsToCompare: [],
        })
      ).toEqual(new Comparison());
    });
  });
});
