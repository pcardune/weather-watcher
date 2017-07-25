/**
 *
 * Button.react.js
 *
 * A common button, if you pass it a prop "route" it'll render a link to a react-router route
 * otherwise it'll render a link with an onclick
 */

import React, {PropTypes, Children} from 'react';
import styled, {css} from 'styled-components';

const backgroundColor = ({disabled, accent, flat, theme}) => {
  if (flat) {
    return 'transparent';
  }
  if (disabled) {
    return theme.colors.divider;
  }
  return theme.colors[accent ? 'accent' : 'primary'];
};

const textColor = ({disabled, accent, flat, theme}) => {
  if (flat) {
    return theme.colors.primaryText;
  }
  if (disabled) {
    return theme.colors.secondaryText;
  }
  return theme.colors[accent ? 'textOnAccent' : 'textOnPrimary'];
};

const boxShadow = ({theme, flat}) => !flat && theme.shadows.level1;

const buttonStyles = css`
  display: inline-block;
  height: 36px;
  min-width: ${props => !props.flat && '88px'};
  text-decoration: none;
  text-transform: uppercase;
  text-align: center;
  border-radius: 2px;
  -webkit-font-smoothing: antialiased;
  -webkit-touch-callout: none;
  user-select: none;
  cursor: pointer;
  outline: 0;
  font-size: 14px;
  line-height: 36px;
  background-color: ${backgroundColor};
  color: ${textColor};
  box-shadow: ${boxShadow};
  padding: 0 15px;

  &:active {
    background: #41addd;
    color: #fff;
  }
`;

const StyledButton = styled.button`${buttonStyles};`;
const A = styled.a`${buttonStyles};`;

function Button(props) {
  // Render an anchor tag
  let button = (
    <A
      href={props.href}
      onClick={!props.disabled && props.onClick}
      accent={props.accent}
      flat={props.flat}
      style={props.style}
      disabled={props.disabled}
    >
      {Children.toArray(props.children)}
    </A>
  );

  // If the Button has a handleRoute prop, we want to render a button
  if (props.handleRoute) {
    button = (
      <StyledButton
        onClick={props.handleRoute}
        accent={props.accent}
        flat={props.flat}
        style={props.style}
        disabled={props.disabled}
      >
        {Children.toArray(props.children)}
      </StyledButton>
    );
  }

  return (
    <div className={props.className}>
      {button}
    </div>
  );
}

Button.propTypes = {
  handleRoute: PropTypes.func,
  href: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  accent: PropTypes.bool,
  flat: PropTypes.bool,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
