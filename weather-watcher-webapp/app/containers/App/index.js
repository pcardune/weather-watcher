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
import loadHomePage from 'bundle-loader?lazy!app/containers/HomePage/load';
import loadFAQ from 'bundle-loader?lazy!app/containers/FAQPage/load';

const Body = styled.div`min-height: 60vh;`;

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

  renderHomePage = ({match: {params: {comparisonId}}}) =>
    <Bundle load={loadHomePage} store={this.props.store}>
      {HomePage =>
        HomePage
          ? <HomePage comparisonId={comparisonId || 'wa-climb-crags'} />
          : <LoadingBar />}
    </Bundle>;

  renderFAQ = () =>
    <Bundle load={loadFAQ}>
      {FAQPage => FAQPage && <FAQPage />}
    </Bundle>;

  render() {
    return (
      <AppWrapper>
        <Helmet
          titleTemplate="%s - Goldilocks Weather"
          defaultTitle="Goldilocks Weather"
          meta={[
            {
              name: 'description',
              content: "Find the weather that's just right",
            },
          ]}
        />
        <Header
          onNewComparison={this.onNewComparison}
          comparisons={this.props.comparisons}
        />
        <Body>
          <Switch>
            <Route exact path="/" render={this.renderHomePage} />
            <Route path="/compare/:comparisonId" render={this.renderHomePage} />
            <Route path="/faq" render={this.renderFAQ} />
            <Route component={NotFound} />
          </Switch>
        </Body>
        <Footer className="page-footer blue">
          <div className="container">
            <div className="row">
              <div className="col s12 m6">
                <h4 className="amber-text">Goldilocks Weather</h4>
                <p className="grey-text text-lighten-4">
                  weather that{"'"}s{' '}
                  <em>
                    <u>just</u>
                  </em>{' '}
                  right
                </p>
              </div>
              <div className="col s12 m6">
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
