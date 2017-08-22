import * as url from '../url';
import {DEFAULT_SCORE_CONFIG} from 'app/constants';

describe('app/utils/url', () => {
  describe('getPathWithScoreConfigAndDate', () => {
    it('will add a scoreConfig param to the given location', () => {
      expect(
        url.getPathWithScoreConfigAndDate(
          {pathname: '/foo'},
          {scoreConfig: {someConfig: [1, 2, 3]}}
        )
      ).toEqual('/foo?scoreConfig=eyJzb21lQ29uZmlnIjpbMSwyLDNdfQ%3D%3D');

      const [pathname, search] = url
        .getPathWithScoreConfigAndDate(
          {pathname: '/foo'},
          {scoreConfig: {someConfig: [1, 2, 3]}}
        )
        .split('?');
      expect(url.getScoreConfigFromLocation({pathname, search})).toEqual({
        someConfig: [1, 2, 3],
      });
    });

    it('will not add a scoreConfig param for the DEFAULT_SCORE_CONFIG', () => {
      expect(
        url.getPathWithScoreConfigAndDate(
          {pathname: '/foo'},
          DEFAULT_SCORE_CONFIG
        )
      ).toEqual('/foo');
    });

    it('will preserve any other query params', () => {
      expect(
        url.getPathWithScoreConfigAndDate(
          {pathname: '/foo', search: 'bar=1'},
          DEFAULT_SCORE_CONFIG
        )
      ).toEqual('/foo?bar=1');
      expect(
        url.getPathWithScoreConfigAndDate(
          {pathname: '/foo', search: 'bar=1'},
          {scoreConfig: {someConfig: [1, 2, 3]}}
        )
      ).toEqual('/foo?bar=1&scoreConfig=eyJzb21lQ29uZmlnIjpbMSwyLDNdfQ%3D%3D');
    });
  });
});
