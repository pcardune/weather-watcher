import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Toolbar, IconButton, Icon, Typography, withStyles} from 'material-ui';

@withStyles({
  title: {flex: 1},
})
export default class CardBar extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.string,
    children: PropTypes.node,
    menu: PropTypes.node,
  };

  static defaultProps = {
    title: '',
    children: null,
    menu: null,
  };

  state = {showMenu: false};

  onClickMenu = event =>
    this.setState({showMenu: true, menuAnchorEl: event.currentTarget});
  onRequestCloseMenu = () => this.setState({showMenu: false});

  closeAndCall = next => event => {
    this.onRequestCloseMenu();
    next(event);
  };

  render() {
    const {title, children, classes, menu} = this.props;
    return (
      <Toolbar>
        <Typography type="title" color="inherit" className={classes.title}>
          {title}
        </Typography>
        {children}
        <IconButton color="contrast" onClick={this.onClickMenu}>
          <Icon>more_vert</Icon>
        </IconButton>

        {menu &&
          <menu.type
            {...menu.props}
            open={this.state.showMenu}
            onRequestClose={this.onRequestCloseMenu}
            anchorEl={this.state.menuAnchorEl}
          >
            {React.Children.map(
              menu.props.children,
              item =>
                item &&
                React.cloneElement(item, {
                  onClick: item.props.onClick
                    ? this.closeAndCall(item.props.onClick)
                    : null,
                })
            )}
          </menu.type>}
      </Toolbar>
    );
  }
}
