import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {
  Drawer,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Divider,
  Button,
  withStyles,
  Icon,
} from 'material-ui';

import firebase from 'app/firebaseApp';
import trackEvent from 'app/trackEvent';
import {
  addComparisonPoint,
  createComparison,
} from 'app/containers/Database/actions';

import NewComparisonButton from './NewComparisonButton';
import SmartLink from './SmartLink';

const styles = theme => ({
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: theme.drawerWidth,
    width: `calc(100% - ${theme.drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    borderRight: 'none !important',
    position: 'relative',
    height: '100%',
    width: theme.drawerWidth,
    boxShadow: theme.shadows[5],
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  navLink: {
    display: 'block',
    width: '100%',
    paddingLeft: theme.spacing.unit * 2,
  },
});

@withRouter
@connect(null, {
  onAddComparisonPoint: addComparisonPoint,
  onCreateComparison: createComparison,
})
@withStyles(styles)
export default class MainDrawer extends Component {
  static propTypes = {
    onCreateComparison: PropTypes.func.isRequired,
    comparisons: PropTypes.object.isRequired,
    handleDrawerClose: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
  };

  renderComparisonsList(type) {
    let filter;
    if (type === 'public') {
      filter = c => !c.creator;
    } else if (type === 'creator') {
      const user = firebase.auth().currentUser;
      const uid = user && user.uid;
      filter = c => uid && c.creator === uid;
    }
    return this.props.comparisons
      .valueSeq()
      .filter(filter)
      .toArray()
      .map(comparison =>
        <ListItem disableGutters button key={comparison.id}>
          <SmartLink
            className={this.props.classes.navLink}
            activeClassName="selected"
            to={`/compare/${comparison.id}`}
          >
            {comparison.name}
          </SmartLink>
        </ListItem>
      );
  }

  render() {
    const {classes} = this.props;
    return (
      <Drawer
        type="persistent"
        classes={{
          paper: classes.drawerPaper,
        }}
        open={this.props.open}
      >
        <div className={classes.drawerInner}>
          <div className={classes.drawerHeader}>
            <Button onClick={this.props.handleDrawerClose}>
              <Icon>chevron_left</Icon>
            </Button>
          </div>
          <Divider />
          <List className={classes.list}>
            <ListSubheader>Comparisons</ListSubheader>
            {this.renderComparisonsList('public')}
          </List>
          <List className={classes.list}>
            <Divider />
            <ListSubheader>Your Comparisons</ListSubheader>
            {this.renderComparisonsList('creator')}
            <ListItem>
              <NewComparisonButton navigateOnSave raised color="accent">
                + New Comparison
              </NewComparisonButton>
            </ListItem>
          </List>
        </div>
      </Drawer>
    );
  }
}
