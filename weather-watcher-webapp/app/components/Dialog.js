import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Portal from 'react-portal';
import styled from 'styled-components';

export const DialogBox = styled.div`
  position: fixed;
  top: 25%;
  left: 25%;
  width: 50%;
  margin: auto;
  min-width: 640px;
  min-height: 100px;
  box-shadow: ${props => props.theme.shadows.level4};
  background: white;
`;

export const DialogHeader = styled.h1`
  font-weight: 100;
  font-size: 20px;
  padding: ${props => props.theme.padding.standard};
  margin: 0;
`;

export const DialogBody = styled.div`
  padding: 0 ${props => props.theme.padding.standard};
`;

export const DialogFooter = styled.div`
  padding: ${props => props.theme.padding.standard};
  display: flex;
  justify-content: flex-end;
  > * {
    margin-left: 10px;
  }
`;

export class BaseDialog extends PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    children: PropTypes.node,
  };
  render() {
    return (
      <Portal
        closeOnEsc
        closeOnOutsideClick
        isOpened={this.props.isOpen}
        onClose={this.props.onClose}
      >
        <DialogBox>
          {this.props.children}
        </DialogBox>
      </Portal>
    );
  }
}

export default class Dialog extends PureComponent {
  static propTypes = {
    ...BaseDialog.propTypes,
    title: PropTypes.node,
  };
  render() {
    const {title, ...baseDialogProps} = this.props;
    return (
      <BaseDialog {...baseDialogProps}>
        <DialogHeader>
          {this.props.title}
        </DialogHeader>
        {this.props.children}
      </BaseDialog>
    );
  }
}
