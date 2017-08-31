import React, {PureComponent, Children} from 'react';
import PropTypes from 'prop-types';
import Theme from 'app/Theme';

function ButtonIcon({icon, left, right, hideLabelOnMobile, className}) {
  const directionClass = left ? 'left' : right ? 'right' : '';
  if (!icon) {
    return null;
  }
  if (hideLabelOnMobile) {
    return (
      <span>
        <i className={`hide-on-large-only material-icons ${className}`}>
          {icon}
        </i>
        <i
          className={`hide-on-med-and-down material-icons ${directionClass} ${className}`}
        >
          {icon}
        </i>
      </span>
    );
  }
  return (
    <i className={`material-icons ${directionClass} ${className}`}>
      {icon}
    </i>
  );
}

ButtonIcon.propTypes = {
  right: PropTypes.bool,
  left: PropTypes.bool,
  icon: PropTypes.string,
  hideLabelOnMobile: PropTypes.bool,
  className: PropTypes.string,
};

ButtonIcon.defaultProps = {
  right: null,
  left: null,
  icon: null,
  hideLabelOnMobile: false,
  className: '',
};

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
    hideLabelOnMobile: PropTypes.bool,
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
    hideLabelOnMobile: false,
  };

  render() {
    const btnClass = this.props.flat
      ? 'btn-flat'
      : this.props.floating ? 'btn-floating' : 'btn';
    const accentClass = this.props.accent
      ? [Theme.colorClass.accent, Theme.colorClass.textOnAccent].join(' ')
      : this.props.disabled ? '' : Theme.colorClass.primary;
    const sizeClass = this.props.large ? 'btn-large' : '';
    const hideOnMobile = this.props.hideLabelOnMobile
      ? 'hide-on-med-and-down'
      : '';
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
        <ButtonIcon
          hideLabelOnMobile={this.props.hideLabelOnMobile}
          className={accentClass}
          icon={this.props.iconLeft}
          left={!!this.props.iconLeft}
        />
        <span className={hideOnMobile}>
          {Children.toArray(this.props.children)}
        </span>
        <ButtonIcon
          hideLabelOnMobile={this.props.hideLabelOnMobile}
          className={accentClass}
          icon={this.props.icon || this.props.iconRight}
          right={!!this.props.iconRight}
        />
      </a>
    );
  }
}
