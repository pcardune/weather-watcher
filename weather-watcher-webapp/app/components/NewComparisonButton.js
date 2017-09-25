import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'material-ui';

import EditComparisonDialog from './EditComparisonDialog';

export default class NewComparisonButton extends Component {
  static propTypes = {
    navigateOnSave: PropTypes.bool,
    onComparisonCreated: PropTypes.func,
  };

  static defaultProps = {
    navigateOnSave: false,
    onComparisonCreated: () => {},
  };

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
    const {navigateOnSave, onComparisonCreated, ...props} = this.props;
    return (
      <span>
        <EditComparisonDialog
          open={this.state.open}
          onRequestClose={this.onClose}
          type="create"
          navigateOnSave={navigateOnSave}
          onComparisonCreated={onComparisonCreated}
        />
        <Button {...props} onClick={this.onClick} />
      </span>
    );
  }
}
