/**
 * Test the HomePage
 */

import React from 'react';
import {mount} from 'enzyme';

import {HomePage, mapDispatchToProps} from '../index';
import {refreshComparison} from '../actions';

xdescribe('<HomePage />', () => {
  it('should refresh the comparison on mount', () => {
    const onRefreshComparison = jest.fn();
    mount(<HomePage onRefreshComparison={onRefreshComparison} />);
    expect(onRefreshComparison).toHaveBeenCalled();
  });

  describe('mapDispatchToProps', () => {
    let dispatch, props;
    beforeEach(() => {
      dispatch = jest.fn();
      props = mapDispatchToProps(dispatch);
    });

    describe('onRefreshComparison', () => {
      it('should be injected', () => {
        expect(props.onRefreshComparison).toBeDefined();
      });

      it('should dispatch refreshComparison when called', () => {
        props.onRefreshComparison();
        expect(dispatch).toHaveBeenCalledWith(refreshComparison());
      });
    });
  });
});
