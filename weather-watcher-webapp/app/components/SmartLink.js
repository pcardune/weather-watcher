import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router';
import {Link as RouterLink, NavLink} from 'react-router-dom';

import {
  getPathWithScoreConfig,
  getScoreConfigFromLocation,
} from 'app/utils/url';

@withRouter
export default class SmartLink extends PureComponent {
  static propTypes = {
    history: PropTypes.object.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
    nav: PropTypes.bool,
    ...RouterLink.propTypes,
    ...NavLink.propTypes,
  };

  static defaultProps = {
    className: '',
    children: null,
    nav: false,
  };

  isActive = (match, location) => location.pathname === this.props.to;

  onClick = event => {
    let {to} = this.props;
    const scoreConfig = getScoreConfigFromLocation(this.props.history.location);
    const [pathname, search] = to.split('?');
    to = getPathWithScoreConfig({pathname, search}, scoreConfig);
    this.props.history.push(to);
    event.preventDefault();
  };

  render() {
    const {nav, activeClassName, className, children, to} = this.props;
    const props = {
      className,
      to,
      children,
      onClick: this.onClick,
    };

    if (nav) {
      return (
        <NavLink
          {...props}
          activeClassName={activeClassName}
          isActive={this.isActive}
        />
      );
    }
    return <RouterLink {...props} />;
  }
}
