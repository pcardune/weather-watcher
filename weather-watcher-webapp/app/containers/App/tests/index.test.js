import {Map} from 'immutable';
import React from 'react';
import {shallow} from 'enzyme';

import Header from 'components/Header';
import {App} from '../index';

describe('<App />', () => {
  let component, props;
  beforeEach(() => {
    props = {
      createComparison: jest.fn().mockReturnValue({
        comparison: {id: 'some-comparison-id'},
      }),
      store: {},
      history: {
        push: jest.fn(),
      },
      comparisons: Map(),
    };
    component = shallow(<App {...props} />);
  });

  const header = () => component.find(Header);

  it('should render the header', () => {
    expect(header().length).toBe(1);
    expect(header().props().onNewComparison).toBe(
      component.instance().onNewComparison
    );
    expect(header().props().comparisons).toBe(props.comparisons);
  });

  it('should create and navigate to newly created comparisons', () => {
    component.instance().onNewComparison();
    expect(props.createComparison).toHaveBeenCalledWith({
      name: 'Untitled Comparison',
    });
    expect(props.history.push).toHaveBeenCalledWith(
      '/compare/some-comparison-id'
    );
  });
});
