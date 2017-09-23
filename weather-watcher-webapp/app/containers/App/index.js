import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import {Link, Route, Switch, withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {subscribeProps} from 'redux-firebase-mirror';
import {Grid} from 'material-ui';

import {myComparisons} from 'app/containers/Database/subscriptions';
import {createComparison} from 'app/containers/Database/actions';
import Header from 'app/components/Header';
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

export class App extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    createComparison: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    comparisons: PropTypes.object.isRequired,
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
    return (
      <div>
        <Header
          onNewComparison={this.onNewComparison}
          comparisons={this.props.comparisons}
        />
        <Body>
          <Switch>
            <Route exact path="/" render={this.renderHomePage} />
            <Route path="/compare/:comparisonId" render={this.renderHomePage} />
            <Route
              path="/locations/:comparisonPointId"
              render={this.renderComparisonPointPage}
            />
            <Route path="/faq" render={this.renderFAQ} />
            <Route component={NotFound} />
          </Switch>
        </Body>
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
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.1/css/materialize.min.css"
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

export default compose(
  withRouter,
  subscribeProps({
    comparisons: myComparisons,
  }),
  connect(null, {
    createComparison,
  })
)(App);
