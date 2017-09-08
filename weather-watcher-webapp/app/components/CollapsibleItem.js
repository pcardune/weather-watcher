import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';

const Wrapper = styled.li`
  &.active {
    .collapsible-body {
      display: block;
    }
  }
`;

export default class CollapsibleItem extends Component {
  static propTypes = {
    icon: PropTypes.node.isRequired,
    header: PropTypes.node.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
  };

  defaultProps: {
    className: '',
    children: null,
  };

  state = {
    active: false,
  };

  onClick = e => {
    this.setState({active: !this.state.active});
    if ([' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }
  };

  render() {
    const activeClass = {active: this.state.active};
    const {icon, header, children, className, active} = this.props;
    return (
      <Wrapper className={cx([activeClass, className])}>
        {typeof header === 'string'
          ? <div
              className={cx('collapsible-header', activeClass)}
              onClick={this.onClick}
            >
              {typeof icon === 'string'
                ? <i className="material-icons">
                    {icon}
                  </i>
                : icon}
            </div>
          : React.cloneElement(header, {
              active,
              onClick: this.onClick,
              icon,
            })}
        <div className={cx('collapsible-body', activeClass)}>
          {children}
        </div>
      </Wrapper>
    );
  }
}

CollapsibleItem.Header = class CollapsibleItemHeader extends Component {
  static propTypes = {
    icon: PropTypes.node.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
    active: PropTypes.bool,
    onClick: PropTypes.func,
    icon: PropTypes.node,
  };

  static defaultProps = {
    className: '',
    children: null,
    active: false,
    onClick: null,
    icon: null,
  };

  render() {
    const {icon, children, className, active} = this.props;
    return (
      <div
        className={cx('collapsible-header', active, className)}
        role="button"
        tabIndex="0"
        onKeyDown={this.props.onClick}
        onClick={this.props.onClick}
      >
        {typeof icon === 'string'
          ? <i className="material-icons">
              {icon}
            </i>
          : icon}
        {children}
      </div>
    );
  }
};
