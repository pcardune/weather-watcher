import React from 'react';

import NavBar from './NavBar';
import HeaderLogo from './HeaderLogo';

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <NavBar>
          <HeaderLogo to="/">Ww</HeaderLogo>
        </NavBar>
      </div>
    );
  }
}

export default Header;
