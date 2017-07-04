import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import {Route, Switch, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import {createComparison} from 'app/containers/Database/actions';
import {selectComparisons} from 'app/containers/Database/selectors';
import Header from 'app/components/Header';
import withProgressBar from 'app/components/ProgressBar';
import Bundle from 'app/components/Bundle';
import loadHomePage from 'bundle-loader?lazy!app/containers/HomePage/load';

const Footer = styled.div`
  margin: 50px;
  text-align: center;
  color: ${props => props.theme.colors.secondaryText};
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
      <Bundle load={loadHomePage} store={this.props.store}>
        {HomePage =>
          HomePage &&
          <HomePage comparisonId={comparisonId || 'wa-climb-crags'} />}
      </Bundle>
    );
  };

  render() {
    return (
      <AppWrapper>
        <Helmet
          titleTemplate="%s - Weather Watcher"
          defaultTitle="Weather Watcher"
          meta={[{name: 'description', content: 'Watch the weather'}]}
        />
        <Header
          onNewComparison={this.onNewComparison}
          comparisons={this.props.comparisons}
        />
        <Switch>
          <Route exact path="/" render={this.renderHomePage} />
          <Route path="/compare/:comparisonId" render={this.renderHomePage} />
          <Route component={NotFound} />
        </Switch>
        <Footer>
          Created by Paul Carduner
        </Footer>
      </AppWrapper>
    );
  }
}

//export default withProgressBar(App);
export default withRouter(
  connect(
    createStructuredSelector({
      comparisons: selectComparisons(),
    }),
    {
      createComparison,
    }
  )(App)
);
