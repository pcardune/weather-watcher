import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Grid} from 'material-ui';

export default class PageBody extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    return (
      <Grid container spacing={0}>
        <Grid item xs={0} md={2} />
        <Grid item xs={12} md={8} style={{padding: 12}}>
          {this.props.children}
        </Grid>
      </Grid>
    );
  }
}
