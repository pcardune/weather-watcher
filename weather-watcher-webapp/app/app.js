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
import {BrowserRouter as Router} from 'react-router-dom';
import FontFaceObserver from 'fontfaceobserver';
import {useScroll} from 'react-router-scroll';
import 'sanitize.css/sanitize.css';
import firebase from 'firebase';
import {ThemeProvider} from 'styled-components';

// Import root app
import App from 'containers/App';

// Load the favicon, the manifest.json file and the .htaccess file
/* eslint-disable import/no-webpack-loader-syntax */
import '!file-loader?name=[name].[ext]!./favicon.ico';
import '!file-loader?name=[name].[ext]!./manifest.json';
import 'file-loader?name=[name].[ext]!./.htaccess'; // eslint-disable-line import/extensions
/* eslint-enable import/no-webpack-loader-syntax */

import loadDatabase from './containers/Database/load';
import configureStore from './store';

// Import CSS reset and Global Styles
import './global-styles';
import Theme from './Theme';

// Observe loading of Open Sans (to remove open sans, remove the <link> tag in
// the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Roboto', {});

// When Open Sans is loaded, add a font-family using Open Sans to the body
openSansObserver.load().then(
  () => {
    document.body.classList.add('fontLoaded');
  },
  () => {
    document.body.classList.remove('fontLoaded');
  }
);

const config = {
  apiKey: 'AIzaSyA9dBTF1MZE3jyhjwG37unYMhbQEGurZF4',
  authDomain: 'weather-watcher-170701.firebaseapp.com',
  databaseURL: 'https://weather-watcher-170701.firebaseio.com',
  projectId: 'weather-watcher-170701',
  storageBucket: 'weather-watcher-170701.appspot.com',
  messagingSenderId: '936791071551',
};
firebase.initializeApp(config);

const initialState = {};
configureStore(initialState, store => {
  loadDatabase({store});
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider theme={Theme}>
        <Router>
          <App store={store} />
        </Router>
      </ThemeProvider>
    </Provider>,
    document.getElementById('app')
  );
});

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
//if (process.env.NODE_ENV === 'production') {
//  const runtime = require('offline-plugin/runtime'); // eslint-disable-line global-require
//  runtime.install({
//    onInstalled: () => {
//      console.log('SW Event:', 'onInstalled');
//    },
//    onUpdating: () => {
//      console.log('SW Event:', 'onUpdating');
//    },
//    onUpdateReady: () => {
//      console.log('SW Event:', 'onUpdateReady');
//      // Tells to new SW to take control immediately
//      runtime.applyUpdate();
//    },
//    onUpdated: () => {
//      console.log('SW Event:', 'onUpdated');
//      // Reload the webpage to load into the new version
//      if (confirm('A new version is available, click ok to refresh')) {
//        window.location.reload();
//      }
//    },
//
//    onUpdateFailed: () => {
//      console.log('SW Event:', 'onUpdateFailed');
//    },
//  });
//}
