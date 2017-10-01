import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
} from 'material-ui';

import Dialog from './Dialog';

export default class AlertDialog extends Component {
  static propTypes = {
    ...Dialog.propTypes,
    title: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    title: '',
    description: '',
  };

  closeAndCall = func => event => {
    this.props.onRequestClose();
    if (func) {
      func(event);
    }
  };

  render() {
    const {title, description, onRequestClose, open, children} = this.props;

    return (
      <Dialog open={open} onRequestClose={onRequestClose}>
        {title &&
          <DialogTitle>
            {title}
          </DialogTitle>}
        {description &&
          <DialogContent>
            <DialogContentText>
              {description}
            </DialogContentText>
          </DialogContent>}
        <DialogActions>
          {children.map((button, index) =>
            React.cloneElement(button, {
              key: index,
              onClick: this.closeAndCall(button.props.onClick),
            })
          )}
        </DialogActions>
      </Dialog>
    );
  }
}
