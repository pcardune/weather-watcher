/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Needed for redux-saga es6 generator support
import 'babel-polyfill';

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Router} from 'react-router';
import {ThemeProvider} from 'styled-components';
import ReactGA from 'react-ga';
import createHistory from 'history/createBrowserHistory';
import Raven from 'raven-js';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import 'react-geosuggest/module/geosuggest.css';
import {MuiThemeProvider} from 'material-ui/styles';
import cookie from 'cookie';

// Import root app
import App from 'app/containers/App';
import FB from 'app/utils/fb';
// Load the favicon, the manifest.json file and the .htaccess file
/* eslint-disable import/no-webpack-loader-syntax */
import '!file-loader?name=[name].[ext]!./favicon.png';
import '!file-loader?name=[name].[ext]!./manifest.json';
import 'file-loader?name=[name].[ext]!./.htaccess'; // eslint-disable-line import/extensions
/* eslint-enable import/no-webpack-loader-syntax */

import loadDatabase from './containers/Database/load';
import configureStore from './store';

// Import CSS reset and Global Styles
import Theme, {MuiTheme} from './Theme';

document.cookie = cookie.serialize('VW', window.innerWidth);

const DEBUG = process.env.NODE_ENV !== 'production';

if (!DEBUG) {
  Raven.config('https://9a78c231e6354e14b6c54f21b3883aa9@sentry.io/199365', {
    environment: process.env.NODE_ENV || 'development',
  }).install();
}

ReactGA.initialize('UA-73170823-3', {
  debug: DEBUG,
});

const history = createHistory();
function trackPageView(location) {
  if (DEBUG) {
    ReactGA.ga('set', 'sendHitTask', null);
  }
  ReactGA.set({page: location.pathname});
  ReactGA.pageview(location.pathname);
}
history.listen(trackPageView);
trackPageView(history.location);

function trackFBPageView() {
  if (DEBUG) {
    console.log('skipping FB AppEvents logging');
  } else {
    FB.AppEvents.logPageView();
  }
}
history.listen(trackFBPageView);

class Main extends React.Component {
  // Remove the server-side injected CSS.
  componentDidMount() {
    const jssStyles = document.getElementById('jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    return <App {...this.props} />;
  }
}

window.onload = () => {
  const initialState = {};
  Promise.all([
    configureStore(initialState),
    // TODO: stop prefetching all of these as it defeats the whole purpose
    // of having separate chunks... :(
    // See https://medium.com/faceyspacey/code-cracked-for-code-splitting-ssr-in-reactlandia-react-loadable-webpack-flush-chunks-and-1a6b0112a8b8
    import('app/containers/HomePage/load'),
    import('app/containers/FAQPage/load'),
    import('app/containers/ComparisonPointPage/load'),
  ]).then(([store]) => {
    loadDatabase({store});
    ReactDOM.render(
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <Router history={history}>
            <MuiThemeProvider theme={MuiTheme}>
              <Main store={store} />
            </MuiThemeProvider>
          </Router>
        </ThemeProvider>
      </Provider>,
      document.getElementById('app')
    );
  });
};
