import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from 'material-ui';

import EditComparisonDialog from './EditComparisonDialog';

export default class NewComparisonButton extends Component {
  static propTypes = {};

  state = {
    open: false,
    name: '',
  };

  onClick = () => {
    this.setState({open: true});
  };

  onClose = () => {
    this.setState({open: false});
  };

  handleChange = name => event => this.setState({[name]: event.target.value});

  render() {
    return (
      <span>
        <EditComparisonDialog
          open={this.state.open}
          onRequestClose={this.onClose}
          type="create"
        />
        <Button {...this.props} onClick={this.onClick} />
      </span>
    );
  }
}
