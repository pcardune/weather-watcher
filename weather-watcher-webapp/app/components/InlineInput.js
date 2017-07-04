import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from 'styled-components';

const sharedCss = css`
  outline: 0;
  margin: 0;
  padding: 0;
`;

const EditableButton = styled.button`
  ${sharedCss}
  cursor: pointer;
`;
const EditableInput = styled.input`
  ${sharedCss}
  border-bottom: 1px solid ${props => props.theme.colors.textOnPrimary};
`;

export default class InlineInput extends PureComponent {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  state = {
    editing: false,
  };

  onChange = event => {
    this.props.onChange(event.target.value);
  };

  onClick = () => {
    this.setState({editing: true});
  };

  onBlur = event => {
    if (this.props.value.trim()) {
      this.setState({editing: false});
    } else {
      event.preventDefault();
    }
  };

  onKeyDown = event => {
    if (event.key === 'Enter') {
      this.onBlur(event);
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.editing && !prevState.editing) {
      this.input.focus();
      this.input.select();
    }
  }

  render() {
    if (this.state.editing) {
      return (
        <EditableInput
          innerRef={el => {
            this.input = el;
          }}
          type="text"
          value={this.props.value}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
        />
      );
    }
    return (
      <EditableButton onClick={this.onClick}>{this.props.value}</EditableButton>
    );
  }
}
