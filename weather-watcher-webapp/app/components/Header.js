import React from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';

const HeaderLogo = styled(Link)`
  font-size: 64px;
  font-weight: 100;
  display: inline-block;
  padding: 0 10px;
  text-decoration: none;
`;

const NavBar = styled.div`
  background-color: ${props => props.theme.colors.primary};
  height: 130px;
  text-align: center;
  border-bottom: 10px solid ${props => props.theme.colors.primaryDark};
  position: relative;
  ${HeaderLogo} {
    color: ${props => props.theme.colors.textOnPrimary};
    line-height: 70px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

class Header extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <NavBar>
        <HeaderLogo to="/">Weather Watcher</HeaderLogo>
      </NavBar>
    );
  }
}

export default Header;
