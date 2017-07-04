/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import {Route, Switch} from 'react-router-dom';

import Header from 'app/components/Header';
import withProgressBar from 'app/components/ProgressBar';
import Bundle from 'app/components/Bundle';
import loadHomePage from 'bundle-loader?lazy!app/containers/HomePage/load';

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

export function App({store}) {
  const HomePageBundle = props => (
    <Bundle load={loadHomePage} store={store}>
      {HomePage =>
        HomePage &&
        <HomePage
          comparisonId={props.match.params.comparisonId || 'wa-climb-crags'}
        />}
    </Bundle>
  );

  return (
    <AppWrapper>
      <Helmet
        titleTemplate="%s - Weather Watcher"
        defaultTitle="Weather Watcher"
        meta={[{name: 'description', content: 'Watch the weather'}]}
      />
      <Header />
      <Switch>
        <Route exact path="/" component={HomePageBundle} />
        <Route path="/compare/:comparisonId" component={HomePageBundle} />
        <Route component={NotFound} />
      </Switch>
    </AppWrapper>
  );
}

//export default withProgressBar(App);
export default App;
