import React, {PureComponent, Children} from 'react';
import PropTypes from 'prop-types';

export default class Button extends PureComponent {
  static propTypes = {
    href: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired,
    accent: PropTypes.bool,
    flat: PropTypes.bool,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    iconRight: PropTypes.string,
    iconLeft: PropTypes.string,
  };

  static defaultProps = {
    href: '',
    onClick: () => undefined,
    accent: false,
    flat: false,
    style: {},
    disabled: false,
    className: '',
    iconRight: '',
    iconLeft: '',
  };

  render() {
    const btnClass = this.props.flat ? 'btn-flat' : 'btn';
    const accentClass = this.props.accent
      ? 'amber grey-text text-darken-4'
      : '';
    return (
      <div className={this.props.className}>
        <a
          className={[btnClass, accentClass].join(' ')}
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
          {this.props.iconRight &&
            <i className="material-icons right">
              {this.props.iconRight}
            </i>}
        </a>
      </div>
    );
  }
}
