import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import {Link, Route, Switch, withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {subscribeProps} from 'redux-firebase-mirror';

import {myComparisons} from 'app/containers/Database/subscriptions';
import {createComparison} from 'app/containers/Database/actions';
import Header from 'app/components/Header';
import LoadingBar from 'app/components/LoadingBar';
import Bundle from 'app/components/Bundle';
import {DEFAULT_COMPARISON_ID} from 'app/constants';

import Theme from 'app/Theme';

const Body = styled.div`
  padding-top: 50px;
  min-height: 60vh;
`;

const Footer = styled.footer`
  h4,
  h5 {
    font-family: 'Clicker Script', cursive;
    font-weight: bold;
  }
  a {
    color: white;
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

  //renderClimbCalculator = () => {
  //  return (
  //    <Bundle load={import('app/containers/ClimbCalculator/load')}>
  //      {ClimbCalculator => ClimbCalculator && <ClimbCalculator />}
  //    </Bundle>
  //  );
  //};

  render() {
    return (
      <AppWrapper>
        <Helmet>
          <title>Goldilocks Weather</title>
          <meta
            name="description"
            content="Find the weather that's just right"
          />
        </Helmet>
        <Header
          onNewComparison={this.onNewComparison}
          comparisons={this.props.comparisons}
        />
        <Body className="grey lighten-3">
          <Switch>
            <Route exact path="/" render={this.renderHomePage} />
            <Route path="/compare/:comparisonId" render={this.renderHomePage} />
            <Route
              path="/locations/:comparisonPointId"
              render={this.renderComparisonPointPage}
            />
            {/*<Route
              path="/climb-calculator"
              render={this.renderClimbCalculator}
            />*/}
            <Route path="/faq" render={this.renderFAQ} />
            <Route component={NotFound} />
          </Switch>
        </Body>
        <Footer className={`page-footer ${Theme.colorClass.primary}`}>
          <div className="container">
            <div className="row">
              <div className="col s12 m3">
                <h4 className="amber-text">Goldilocks Weather</h4>
                <p className="grey-text text-lighten-4">
                  weather that{"'"}s{' '}
                  <em>
                    <u>just</u>
                  </em>{' '}
                  right
                </p>
              </div>
              <div className="col s12 m3">
                <h4>Links</h4>
                <ul>
                  <li>
                    <Link to="/FAQ">FAQ</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-copyright">
            <div className="container">© 2017 goldilocksweather.com</div>
          </div>
        </Footer>
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
