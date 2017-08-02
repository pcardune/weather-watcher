import * as url from '../url';
import {DEFAULT_SCORE_CONFIG} from 'app/constants';

describe('app/utils/url', () => {
  describe('getJSONFromQueryParam', () => {
    it('returns the parsed valued of a base64 encoded json string in a search string', () => {
      expect(
        url.getJSONFromQueryParam(
          {search: `foo=${btoa(JSON.stringify({bar: 1}))}`},
          'foo',
          'default value'
        )
      ).toEqual({bar: 1});
    });

    it('returns the default value when there is no search string', () => {
      expect(
        url.getJSONFromQueryParam({search: ''}, 'foo', 'default value')
      ).toEqual('default value');
    });

    it('returns the default value when the search string does not contain the paramName', () => {
      expect(
        url.getJSONFromQueryParam(
          {search: 'someParam=1'},
          'foo',
          'default value'
        )
      ).toEqual('default value');
    });

    it('returns the default value when the json value cannot be parsed', () => {
      expect(
        url.getJSONFromQueryParam(
          {search: 'someParam=1&foo=aslfkjasdlkfj'},
          'foo',
          'default value'
        )
      ).toEqual('default value');

      expect(
        url.getJSONFromQueryParam(
          {search: `someParam=1&foo=${btoa('foo')}`},
          'foo',
          'default value'
        )
      ).toEqual('default value');
    });
  });

  describe('getPathWithScoreConfig', () => {
    it('will add a scoreConfig param to the given location', () => {
      expect(
        url.getPathWithScoreConfig({pathname: '/foo'}, {someConfig: [1, 2, 3]})
      ).toEqual('/foo?scoreConfig=eyJzb21lQ29uZmlnIjpbMSwyLDNdfQ%3D%3D');

      const [pathname, search] = url
        .getPathWithScoreConfig({pathname: '/foo'}, {someConfig: [1, 2, 3]})
        .split('?');
      expect(url.getScoreConfigFromLocation({pathname, search})).toEqual({
        someConfig: [1, 2, 3],
      });
    });

    it('will not add a scoreConfig param for the DEFAULT_SCORE_CONFIG', () => {
      expect(
        url.getPathWithScoreConfig({pathname: '/foo'}, DEFAULT_SCORE_CONFIG)
      ).toEqual('/foo');
    });

    it('will preserve any other query params', () => {
      expect(
        url.getPathWithScoreConfig(
          {pathname: '/foo', search: 'bar=1'},
          DEFAULT_SCORE_CONFIG
        )
      ).toEqual('/foo?bar=1');
      expect(
        url.getPathWithScoreConfig(
          {pathname: '/foo', search: 'bar=1'},
          {someConfig: [1, 2, 3]}
        )
      ).toEqual('/foo?bar=1&scoreConfig=eyJzb21lQ29uZmlnIjpbMSwyLDNdfQ%3D%3D');
    });
  });
});
