import React, {PureComponent} from 'react';
import convert from 'convert-units';
import PropTypes from 'prop-types';

import {round} from 'app/utils/math';

function formatNumber({value, from, to, roundTo, nanText}) {
  if (from && to) {
    value = convert(value).from(from).to(to);
  }
  return isNaN(value) ? nanText : round(value, roundTo);
}

/* eslint-disable react/no-unused-prop-types */
export default class Number extends PureComponent {
  static propTypes = {
    value: PropTypes.number,
    from: PropTypes.string,
    to: PropTypes.string,
    roundTo: PropTypes.number,
    nanText: PropTypes.string,
  };

  static defaultProps = {
    value: undefined,
    from: undefined,
    to: undefined,
    roundTo: undefined,
    nanText: '-',
  };

  render() {
    return (
      <span>
        {formatNumber(this.props)}
      </span>
    );
  }
}
