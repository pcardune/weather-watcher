import React, {PureComponent} from 'react';
import convert from 'convert-units';
import PropTypes from 'prop-types';

import {round} from 'app/utils/math';

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
    let {value} = this.props;
    const {from, to, roundTo, nanText} = this.props;
    if (from && to) {
      value = convert(value).from(from).to(to);
    }
    return <span>{isNaN(value) ? nanText : round(value, roundTo)}</span>;
  }
}
