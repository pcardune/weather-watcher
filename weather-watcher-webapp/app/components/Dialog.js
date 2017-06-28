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
  box-shadow: ${props => props.theme.shadows.level1};
  background: white;

  h1 {
    font-weight: 100;
    font-size: 20px;
    padding: 15px;
    margin: 0;
  }
`;

export default class Dialog extends PureComponent {
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
