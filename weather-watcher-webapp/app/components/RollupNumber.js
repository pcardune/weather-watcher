import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {safeAverage, safeMin, safeMax} from 'app/utils/math';
import Number from './Number';

const RollupFuncs = {min: safeMin, max: safeMax, avg: safeAverage};

export default class RollupNumber extends PureComponent {
  static propTypes = {
    values: PropTypes.arrayOf(PropTypes.number),
    from: PropTypes.string,
    to: PropTypes.string,
    roundTo: PropTypes.number,
    nanText: PropTypes.string,
    type: PropTypes.oneOf(Object.keys(RollupFuncs)),
  };

  static defaultProps = {
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
    return <Number {...rest} value={func(values)} />;
  }
}
