import fs from 'fs';
import path from 'path';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {Provider} from 'react-redux';
import {StaticRouter} from 'react-router';
import firebase from 'firebase/app';
import {ThemeProvider, ServerStyleSheet} from 'styled-components';

// Import root app
import App from 'app/containers/App';

import loadDatabase from 'app/containers/Database/load';
import configureStore from 'app/store';

// Import CSS reset and Global Styles
import Theme from 'app/Theme';

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

let manifest;
function getAssetPath(name) {
  if (!manifest) {
    manifest = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'build/asset-manifest.json'))
    );
  }
  return `/${manifest[name]}`;
}

module.exports = (req, res) => {
  configureStore(initialState, store => {
    loadDatabase({store});
    const context = {};
    const style = `html,
          body {
            height: 100%;
            width: 100%;
            line-height: 1.5;
          }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    body.fontLoaded {
      font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    #app {
      background-color: #fff;
      min-height: 100%;
      min-width: 100%;
    }
    #landing-screen {
      font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      text-align: center;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
    }
    #landing-screen h1 {
      font-family: 'Clicker Script', cursive;
      font-weight: bold;
      margin-bottom: 0;
      font-size: 5em;
    }
    #landing-screen h5 {
      margin-bottom: 1em;
      font-weight: 300;
    }

    #landing-screen-loading {
      color: #FFFFFF;
      text-align: center;
      padding: 10px;
      font-weight: initial;
      font-size: 24px;
    }`;
    const sheet = new ServerStyleSheet();
    const main = renderToString(
      sheet.collectStyles(
        <Provider store={store}>
          <ThemeProvider theme={Theme}>
            <StaticRouter location={req.url} context={context}>
              <App store={store} />
            </StaticRouter>
          </ThemeProvider>
        </Provider>
      )
    );
    const styleTags = sheet.getStyleElement();
    const html = renderToString(
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="manifest" href="manifest.json" />
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/10up-sanitize.css/5.0.0/sanitize.min.css"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.1/css/materialize.min.css"
          />
          <link rel="icon" type="image/png" href="/favicon.png" />

          <meta name="mobile-web-app-capable" content="yes" />
          <link
            href="https://fonts.googleapis.com/css?family=Clicker+Script"
            rel="stylesheet"
          />
          <title>Goldilocks Weather</title>
          <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAK8WIt0WlA2L-e7Hpqmri9b-dZwhyNbEk&libraries=places" />
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.1.0/dist/leaflet.css"
            integrity="sha512-wcw6ts8Anuw10Mzh9Ytw4pylW8+NAD4ch3lqm9lzAsTxg0GFeJgoAtxuCLREZSC5lUXdVyo/7yfsqFjQ4S+aKw=="
            crossOrigin=""
          />
          <style>
            {style}
          </style>
          {styleTags}
        </head>
        <body>
          <noscript>
            If you{"'"}re seeing this message, that means{' '}
            <strong>JavaScript has been disabled on your browser</strong>,
            please <strong>enable JS</strong> to make this app work.
          </noscript>

          <div
            id="app"
            className="grey lighten-3"
            dangerouslySetInnerHTML={{__html: main}}
          />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700"
            rel="stylesheet"
          />
          {process.env.NODE_ENV === 'development' &&
            <script src="/reactBoilerplateDeps.dll.js" />}
          <script src={getAssetPath('main.js')} />
        </body>
      </html>
    );
    if (context.url) {
      res.writeHead(301, {
        Location: context.url,
      });
      res.end();
    } else {
      res.write(`
      <!doctype html>
      ${html}
    `);
      res.end();
    }
    res.send();
  });
};
