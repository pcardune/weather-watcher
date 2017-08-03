import React, {PureComponent, Children} from 'react';
import PropTypes from 'prop-types';
import Theme from 'app/Theme';

export default class Button extends PureComponent {
  static propTypes = {
    href: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node,
    accent: PropTypes.bool,
    flat: PropTypes.bool,
    floating: PropTypes.bool,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    iconRight: PropTypes.string,
    iconLeft: PropTypes.string,
    icon: PropTypes.string,
    large: PropTypes.bool,
  };

  static defaultProps = {
    href: null,
    onClick: () => undefined,
    accent: false,
    flat: false,
    large: false,
    floating: false,
    style: {},
    disabled: false,
    className: '',
    iconRight: '',
    iconLeft: '',
    icon: '',
    children: null,
  };

  render() {
    const btnClass = this.props.flat
      ? 'btn-flat'
      : this.props.floating ? 'btn-floating' : 'btn';
    const accentClass = this.props.accent
      ? [Theme.colorClass.accent, Theme.colorClass.textOnAccent].join(' ')
      : this.props.disabled ? '' : Theme.colorClass.primary;
    const sizeClass = this.props.large ? 'btn-large' : '';
    return (
      <a
        className={[
          btnClass,
          accentClass,
          sizeClass,
          this.props.className,
        ].join(' ')}
        href={this.props.href}
        onClick={!this.props.disabled && this.props.onClick}
        style={this.props.style}
        disabled={this.props.disabled}
      >
        {this.props.iconLeft &&
          <i className="material-icons left">
            {this.props.iconLeft}
          </i>}
        {Children.toArray(this.props.children)}
        {this.props.icon &&
          <i className={`material-icons ${accentClass}`}>
            {this.props.icon}
          </i>}
        {this.props.iconRight &&
          <i className={`material-icons right`}>
            {this.props.iconRight}
          </i>}
      </a>
    );
  }
}
