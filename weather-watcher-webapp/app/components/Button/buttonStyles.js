import {css} from 'styled-components';

const backgroundColor = ({accent, flat, theme}) => {
  if (flat) {
    return 'transparent';
  }
  return theme.colors[accent ? 'accent' : 'primary'];
};

const textColor = ({accent, flat, theme}) => {
  if (flat) {
    return theme.colors.primaryText;
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

export default buttonStyles;
