import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Collapsible extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    return (
      <ul
        className="collapsible collapsible-accordion"
        data-collapsible="accordion"
      >
        {this.props.children}
      </ul>
    );
  }
}
