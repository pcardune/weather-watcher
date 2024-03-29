import PropTypes from 'prop-types';
import React from 'react';

const buttonStyles = {
  border: '1px solid #eee',
  borderRadius: 3,
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
  fontSize: 15,
  padding: '3px 10px',
  margin: 10,
};

const Button = ({children, onClick}) =>
  <button style={buttonStyles} onClick={onClick}>
    {children}
  </button>;

Button.propTypes = {
  children: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};
Button.defaultProps = {
  onClick: () => {},
};

export default Button;
