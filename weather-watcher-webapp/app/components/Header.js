import uuid from 'uuid';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from 'styled-components';
import {Link, NavLink} from 'react-router-dom';

const HeaderLogo = styled(Link)`
  font-size: 10vw;
  font-weight: 100;
  display: inline-block;
  text-decoration: none;
`;

const QuickLinks = styled.div`
  background: ${props => props.theme.colors.primaryDark};
  text-align: center;
`;

const QuickLinkCSS = css`
  display: inline-block;
  padding: 10px;
  color: ${props => props.theme.colors.textOnPrimary};
  text-decoration: none;
  cursor: pointer;
`;

const QuickButton = styled.a`
  ${QuickLinkCSS}
`;

const QuickLink = styled(NavLink)`
  ${QuickLinkCSS}
  &.selected {
    text-decoration: underline;
  }
`;

const NavBar = styled.div`
  background-color: ${props => props.theme.colors.primary};
  text-align: center;
  position: relative;
  ${HeaderLogo} {
    color: ${props => props.theme.colors.textOnPrimary};
  }
`;

class Header extends Component {
  static propTypes = {
    onNewComparison: PropTypes.func.isRequired,
    comparisons: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div>
        <NavBar>
          <HeaderLogo to="/">Rad Weather</HeaderLogo>
        </NavBar>
        <QuickLinks>
          {this.props.comparisons.valueSeq().map(comparison => (
            <QuickLink
              key={comparison.id}
              activeClassName="selected"
              to={`/compare/${comparison.id}`}
            >
              {comparison.name}
            </QuickLink>
          ))}
          <QuickButton onClick={this.props.onNewComparison}>
            + New Comparison
          </QuickButton>
        </QuickLinks>
      </div>
    );
  }
}

export default Header;
