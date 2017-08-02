import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router';
import {Link as RouterLink, NavLink} from 'react-router-dom';
import isEqual from 'lodash.isequal';

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
    ...RouterLink.propTypes,
    ...NavLink.propTypes,
  };

  static defaultProps = {
    ...NavLink.defaultProps,
    ...RouterLink.defaultProps,
    className: '',
    children: null,
  };

  isActive = (match, location) => location.pathname === this.props.to;

  state = {
    scoreConfig: getScoreConfigFromLocation(this.props.location),
  };

  componentDidMount() {
    this.unlisten = this.props.history.listen(location => {
      const scoreConfig = getScoreConfigFromLocation(location);
      if (!isEqual(scoreConfig, this.state.scoreConfig)) {
        this.setState({scoreConfig});
      }
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const {activeClassName, className, children, to} = this.props;
    const [pathname, search] = to.split('?');
    const props = {
      className,
      to: getPathWithScoreConfig({pathname, search}, this.state.scoreConfig),
      children,
    };

    if (activeClassName) {
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
