import {css} from 'styled-components';

const buttonStyles = css`
  display: inline-block;
  height: 36px;
  min-width: 88px;
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
  background-color: ${props => props.theme.colors[props.accent ? 'accent' : 'primary']};
  color: ${props => props.theme.colors[props.accent ? 'textOnAccent' : 'textOnPrimary']};
  box-shadow: ${props => props.theme.shadows.level1};
  padding: 0 15px;

  &:active {
    background: #41addd;
    color: #fff;
  }
`;

export default buttonStyles;
