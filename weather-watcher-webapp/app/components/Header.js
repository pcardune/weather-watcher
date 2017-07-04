import React, {Component} from 'react';
import styled from 'styled-components';
import {Link, NavLink} from 'react-router-dom';

const HeaderLogo = styled(Link)`
  font-size: 64px;
  font-weight: 100;
  display: inline-block;
  padding: 0 10px;
  text-decoration: none;
`;

const QuickLinks = styled.div`
  background: ${props => props.theme.colors.primaryDark};
  text-align: center;
`;

const QuickLink = styled(NavLink)`
  display: inline-block;
  padding: 10px;
  color: ${props => props.theme.colors.textOnPrimary};
  text-decoration: none;

  &.selected {
    text-decoration: underline;
  }
`;

const NavBar = styled.div`
  background-color: ${props => props.theme.colors.primary};
  height: 130px;
  text-align: center;
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

class Header extends Component {
  render() {
    return (
      <div>
        <NavBar>
          <HeaderLogo to="/">Rad Weather</HeaderLogo>
        </NavBar>
        <QuickLinks>
          <QuickLink
            activeClassName="selected"
            to="/compare/wa-climb-mountains"
          >
            Mountains
          </QuickLink>
          <QuickLink activeClassName="selected" to="/compare/wa-climb-crags">
            Crags
          </QuickLink>
          <QuickLink activeClassName="selected" to="/compare/wa-climb-passes">
            Passes
          </QuickLink>
        </QuickLinks>
      </div>
    );
  }
}

export default Header;
