import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  withStyles,
  Icon,
  Hidden,
} from 'material-ui';

import {addComparisonPoint} from 'app/containers/Database/actions';
import {MuiTheme} from 'app/Theme';
import {round} from 'app/utils/math';
import trackEvent from 'app/trackEvent';
import Logo from 'app/components/Logo';

import SmartLink from './SmartLink';
import LocationTypeahead, {LocationTypeaheadWrapper} from './LocationTypeahead';

const NavBar = styled.div`
  text-align: center;
  position: relative;
  background: ${MuiTheme.palette.primary[500]};
  ${SmartLink} {
    color: white;
    display: inline-block;
    text-decoration: none;

    h1 {
      font-family: 'Clicker Script', cursive;
      font-weight: bold;
      margin-bottom: 0;
      font-size: 5em;
      color: ${MuiTheme.palette.secondary[400]};
    }
    h5 {
      margin-bottom: 1em;
      font-weight: 300;
      color: ${MuiTheme.palette.secondary[50]};
    }
  }
`;

const SearchBox = styled.div`
  color: black;
  ${LocationTypeaheadWrapper} {
    .geosuggest__input-wrapper {
      display: flex;
    }
    input {
      height: inherit;
      margin: 0px;
      padding: 10px;
      border-radius: 5px;
      color: white;
    }
  }
`;

const styles = theme => ({
  appBar: {
    width: '100%',
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
  toolbar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  toolbarShift: {
    marginLeft: -theme.drawerWidth,
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  menu: {
    overflow: 'hidden',
  },
  menuShift: {
    //    flexBasis: `0%`,
    //    transition: theme.transitions.create(['flex-basis'], {
    //      easing: theme.transitions.easing.easeOut,
    //      duration: theme.transitions.duration.enteringScreen,
    //    }),
  },
  hide: {
    display: 'none',
  },
  sublogo: {
    color: theme.palette.secondary[50],
  },
});

@withRouter
@connect(null, {onAddComparisonPoint: addComparisonPoint})
@withStyles(styles)
export default class MainAppBar extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    onAddComparisonPoint: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    handleDrawerOpen: PropTypes.func.isRequired,
  };

  onChangeLocation = async (suggestion, typeahead) => {
    const {gmaps, location: position, matchedSubstrings} = suggestion;
    const name = gmaps.address_components[0].long_name;
    const placeId = gmaps.place_id;
    const id = `${name}|${round(position.lat, 4)}|${round(position.lng, 4)}`
      .replace(/\./g, ',')
      .replace(/\s/g, '')
      .toLowerCase();
    this.props.onAddComparisonPoint({
      id,
      name,
      position,
      placeId,
    });
    this.props.history.push(`/locations/${id}`);
    try {
      trackEvent('Search', {
        search_string: suggestion.label.slice(
          matchedSubstrings.offset,
          matchedSubstrings.length
        ),
        content_ids: [id],
        content_type: 'comparisonPoint',
      });
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(e);
      }
    }
    typeahead.clear();
    typeahead.blur();
  };

  render() {
    const {classes} = this.props;
    return (
      <div
        className={classNames(
          classes.appBar,
          this.props.open && classes.appBarShift
        )}
      >
        <Hidden mdUp>
          <div
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              position: 'absolute',
              width: '100vw',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 64,
              }}
            >
              <IconButton
                style={{position: 'absolute', left: 0}}
                disableRipple
                aria-label="open drawer"
                onClick={this.props.handleDrawerOpen}
                className={classNames(classes.menuButton)}
              >
                <Icon>menu</Icon>
              </IconButton>
              <Typography type="headline" noWrap align="center">
                <Logo />
              </Typography>
            </div>
            <SearchBox>
              <LocationTypeahead onChange={this.onChangeLocation} />
            </SearchBox>
          </div>
        </Hidden>
        <Hidden smDown>
          <AppBar position="static">
            <Toolbar
              disableGutters
              className={classNames(
                classes.toolbar,
                this.props.open && classes.toolbarShift
              )}
            >
              <Grid container spacing={0} align="center">
                <Grid
                  item
                  xs={2}
                  className={classNames(
                    classes.menu,
                    this.props.open && classes.menuShift
                  )}
                >
                  <Button
                    color="contrast"
                    aria-label="open drawer"
                    onClick={this.props.handleDrawerOpen}
                    className={classNames(classes.menuButton)}
                  >
                    <Icon>menu</Icon>
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <SmartLink to="/">
                    <Typography type="headline" noWrap>
                      <Logo />
                    </Typography>
                    <Typography
                      component="span"
                      type="subheading"
                      className={classes.sublogo}
                      noWrap
                    >
                      weather that{"'"}s{' '}
                      <em>
                        <u>just</u>
                      </em>{' '}
                      right
                    </Typography>
                  </SmartLink>
                </Grid>
                <Grid item xs={6}>
                  <SearchBox>
                    <LocationTypeahead onChange={this.onChangeLocation} />
                  </SearchBox>
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
        </Hidden>
      </div>
    );
  }
}
