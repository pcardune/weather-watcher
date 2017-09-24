import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui';

@withStyles(theme => ({
  root: {
    fontFamily: "'Clicker Script', cursive",
    fontWeight: 'bold',
    color: theme.palette.secondary[400],
  },
}))
export default class Logo extends Component {
  static propTypes = {};

  render() {
    return <span className={this.props.classes.root}>Goldilocks Weather</span>;
  }
}
