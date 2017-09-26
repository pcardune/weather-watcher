import {List} from 'immutable';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import {Link, Route, Switch, withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {subscribeProps} from 'redux-firebase-mirror';
import {Grid, withStyles} from 'material-ui';
import classNames from 'classnames';

import {myComparisons, getUserId} from 'app/containers/Database/subscriptions';
import {createComparison} from 'app/containers/Database/actions';
import MainDrawer from 'app/components/MainDrawer';
import MainAppBar from 'app/components/MainAppBar';
import LoadingBar from 'app/components/LoadingBar';
import Bundle from 'app/components/Bundle';
import {DEFAULT_COMPARISON_ID} from 'app/constants';

import Theme, {MuiTheme} from 'app/Theme';

const Body = styled.div`
  padding-top: 50px;
  padding-bottom: 50px;
  min-height: 60vh;
  background: ${MuiTheme.palette.background.contentFrame};
`;

const Footer = styled.footer`
  background: ${MuiTheme.palette.primary[500]};
  color: white;
  h4,
  h5 {
    font-family: 'Clicker Script', cursive;
    font-weight: bold;
  }
  h4.logo-text {
    color: ${MuiTheme.palette.secondary[400]};
  }
  a {
    color: white;
  }
  p {
    color: ${MuiTheme.palette.primary[50]};
  }
  .copyright {
    background: ${MuiTheme.palette.primary[600]};
  }
`;

const AppWrapper = styled.div`
  margin: 0 0;
  display: flex;
  min-height: 100%;
  padding: 0;
  flex-direction: column;
`;

function NotFound() {
  return <div>Not found</div>;
}

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.contentFrame,
    width: '100%',
    zIndex: 1,
  },
  contentShift: {
    marginLeft: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  content: {
    width: '100%',
    marginLeft: -theme.drawerWidth,
    flexGrow: 1,
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: 'calc(100% - 56px)',
    minHeight: 'calc(100vh - 234px)',
    marginTop: 100,
    [theme.breakpoints.up('md')]: {
      content: {
        height: 'calc(100% - 64px)',
        marginTop: 64,
      },
    },
  },
});

@withRouter
@subscribeProps({
  comparisons: myComparisons,
})
@connect(state => ({uid: getUserId(state)}), {
  createComparison,
})
@withStyles(styles)
export default class App extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    createComparison: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    comparisons: PropTypes.object,
  };

  static defaultProps = {comparisons: List()};

  state = {
    open: false,
  };

  handleDrawerOpen = () => {
    this.setState({open: true});
  };

  handleDrawerClose = () => {
    this.setState({open: false});
  };

  onNewComparison = () => {
    const comparison = this.props.createComparison({
      name: 'Untitled Comparison',
    }).comparison;
    this.props.history.push(`/compare/${comparison.id}`);
  };

  renderHomePage = ({match: {params: {comparisonId}}}) => {
    return (
      <Bundle
        load={import('app/containers/HomePage/load')}
        store={this.props.store}
      >
        {HomePage =>
          HomePage
            ? <HomePage comparisonId={comparisonId || DEFAULT_COMPARISON_ID} />
            : <LoadingBar />}
      </Bundle>
    );
  };

  renderFAQ = () => {
    return (
      <Bundle load={import('app/containers/FAQPage/load')}>
        {FAQPage => FAQPage && <FAQPage />}
      </Bundle>
    );
  };

  renderComparisonPointPage = ({match: {params: {comparisonPointId}}}) => {
    return (
      <Bundle load={import('app/containers/ComparisonPointPage/load')}>
        {ComparisonPointPage =>
          ComparisonPointPage &&
          <ComparisonPointPage comparisonPointId={comparisonPointId} />}
      </Bundle>
    );
  };

  renderClimbCalculator = () => {
    return (
      <Bundle load={import('app/containers/ClimbCalculator/load')}>
        {ClimbCalculator => ClimbCalculator && <ClimbCalculator />}
      </Bundle>
    );
  };

  renderSite = () => {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <MainAppBar
            open={this.state.open}
            handleDrawerOpen={this.handleDrawerOpen}
          />
          <MainDrawer
            open={this.state.open}
            onNewComparison={this.onNewComparison}
            comparisons={this.props.comparisons}
            handleDrawerClose={this.handleDrawerClose}
            handleDrawerOpen={this.handleDrawerOpen}
          />
          <main
            className={classNames(
              classes.content,
              this.state.open && classes.contentShift
            )}
          >
            <Switch>
              <Route exact path="/" render={this.renderHomePage} />
              <Route
                path="/compare/:comparisonId"
                render={this.renderHomePage}
              />
              <Route
                path="/locations/:comparisonPointId"
                render={this.renderComparisonPointPage}
              />
              <Route path="/faq" render={this.renderFAQ} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
        <Footer>
          <Grid container spacing={0}>
            <Grid item md={2} xs={1} />
            <Grid item md={3} xs={11}>
              <h4 className="logo-text">Goldilocks Weather</h4>
              <p>
                weather that{"'"}s{' '}
                <em>
                  <u>just</u>
                </em>{' '}
                right
              </p>
            </Grid>
            <Grid item md={2} xs={1} hidden={{mdUp: true}} />
            <Grid item md={7} xs={11}>
              <h4>Links</h4>
              <ul>
                <li>
                  <Link to="/FAQ">FAQ</Link>
                </li>
              </ul>
            </Grid>
          </Grid>
          <Grid container spacing={0} className="copyright">
            <Grid item md={2} xs={1} />
            <Grid item md={3} xs={11}>
              <p>© 2017 goldilocksweather.com</p>
            </Grid>
          </Grid>
        </Footer>
      </div>
    );
  };

  render() {
    return (
      <AppWrapper>
        <Helmet>
          <title>Goldilocks Weather</title>
          <meta
            name="description"
            content="Find the weather that's just right"
          />
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
        </Helmet>
        <Switch>
          <Route path="/climb-calculator" render={this.renderClimbCalculator} />
          <Route render={this.renderSite} />
        </Switch>
      </AppWrapper>
    );
  }
}
