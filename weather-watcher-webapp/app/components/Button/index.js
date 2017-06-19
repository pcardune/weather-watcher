/**
 *
 * Button.react.js
 *
 * A common button, if you pass it a prop "route" it'll render a link to a react-router route
 * otherwise it'll render a link with an onclick
 */

import React, {PropTypes, Children} from 'react';

import A from './A';
import StyledButton from './StyledButton';

function Button(props) {
  // Render an anchor tag
  let button = (
    <A
      href={props.href}
      onClick={props.onClick}
      accent={props.accent}
      flat={props.flat}
      style={props.style}
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
      >
        {Children.toArray(props.children)}
      </StyledButton>
    );
  }

  return (
    <div>
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
};

export default Button;
