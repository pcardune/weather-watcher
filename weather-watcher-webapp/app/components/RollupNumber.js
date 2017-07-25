import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {safeAverage, safeMin, safeMax} from 'app/utils/math';
import Number from './Number';

const RollupFuncs = {min: safeMin, max: safeMax, avg: safeAverage};

export default class RollupNumber extends PureComponent {
  static propTypes = {
    childComponent: PropTypes.func,
    values: PropTypes.arrayOf(PropTypes.number),
    from: PropTypes.string,
    to: PropTypes.string,
    roundTo: PropTypes.number,
    nanText: PropTypes.string,
    type: PropTypes.oneOf(Object.keys(RollupFuncs)),
  };

  static defaultProps = {
    childComponent: Number,
    values: [],
    from: undefined,
    to: undefined,
    roundTo: undefined,
    nanText: '-',
    type: 'avg',
  };

  render() {
    const {values, type, ...rest} = this.props;
    const func = RollupFuncs[type];
    const Component = this.props.childComponent;
    return <Component {...rest} value={func(values)} />;
  }
}
