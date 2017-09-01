import fs from 'fs';
import path from 'path';
import React from 'react';
import {renderToString, renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';
import {StaticRouter} from 'react-router';
import {ThemeProvider, ServerStyleSheet} from 'styled-components';
import {getDehydratedState, receiveSnapshots} from 'redux-firebase-mirror';

import firebase from 'app/firebaseApp';
import App from 'app/containers/App';
import loadDatabase from 'app/containers/Database/load';
import {
  getForecastId,
  getGridForecastId,
} from 'app/containers/Database/subscriptions';
import configureStore from 'app/store';

import Theme from 'app/Theme';

const initialState = {};

let manifest;
function getAssetPath(name) {
  if (process.env.NODE_ENV === 'production') {
    if (!manifest) {
      manifest = JSON.parse(
        fs.readFileSync(
          path.resolve(process.cwd(), 'build/asset-manifest.json')
        )
      );
    }
    name = manifest[name];
  }
  return `/${name}`;
}

function prefetchDataForStore(store) {
  const db = firebase.database();
  const dispatchSnapshot = snapshot => {
    store.dispatch(receiveSnapshots([snapshot]));
  };
  ['comparisons', 'comparisonPoints'].forEach(rootPath => {
    db.ref(rootPath).on('child_added', dispatchSnapshot);
    db.ref(rootPath).on('child_changed', dispatchSnapshot);
  });
  db.ref('noaaPoints').on('child_added', snapshot => {
    dispatchSnapshot(snapshot);
    const noaaPoint = snapshot.val();
    [
      `/noaaDailyForecasts/${getForecastId(noaaPoint)}`,
      `/noaaGridForecasts/${getGridForecastId(noaaPoint)}`,
      `/noaaHourlyForecasts/${getForecastId(noaaPoint)}`,
    ].forEach(p => {
      db.ref(p).limitToLast(1).on('value', dispatchSnapshot);
    });
  });
}

let sharedStore;
async function getSharedStore() {
  if (!sharedStore) {
    sharedStore = await configureStore(initialState);
    loadDatabase({store: sharedStore});
  }
  return sharedStore;
}

getSharedStore().then(prefetchDataForStore);

module.exports = async (req, res) => {
  let lastWrite = new Date().getTime();
  const write = (description, content) => {
    res.write(content);
    const time = new Date().getTime();
    console.log(
      `rendered ${description}: ${content.length} bytes, ${time - lastWrite} ms`
    );
    lastWrite = time;
  };
  const store = await getSharedStore();
  if (req.path === '/initialState.js') {
    const state = JSON.stringify({
      firebaseMirror: getDehydratedState(store.getState()),
    }).replace(/</g, '\\u003c');
    write('state', `window.REDUX_INITIAL_STATE = (${state});`);
    res.end();
    return;
  }
  const context = {};
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
  if (context.url) {
    res.writeHead(301, {
      Location: context.url,
    });
    res.end();
    return;
  }
  write(
    'body',
    `<!doctype html>
<html lang="en">
<head>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAK8WIt0WlA2L-e7Hpqmri9b-dZwhyNbEk&libraries=places"></script>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.1.0/dist/leaflet.css"
    integrity="sha512-wcw6ts8Anuw10Mzh9Ytw4pylW8+NAD4ch3lqm9lzAsTxg0GFeJgoAtxuCLREZSC5lUXdVyo/7yfsqFjQ4S+aKw=="
    crossOrigin=""
  />
  <style>
    html,
    body {
      height: 100%;
      width: 100%;
      line-height: 1.5;
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
  </style>
  ${sheet.getStyleTags()}
  </head>
  <body>
    <noscript>
      If you're seeing this message, that means
      <strong>JavaScript has been disabled on your browser</strong>, please
      <strong>enable JS</strong> to make this app work.
    </noscript>
    <div
      id="app"
      className="grey lighten-3"
    >${main}</div>
    <link
      href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700"
      rel="stylesheet"
    />
    ${process.env.NODE_ENV === 'development'
      ? '<script src="/reactBoilerplateDeps.dll.js"></script>'
      : ''}

    <script src="/initialState.js"></script>
    <script src="${getAssetPath('main.js')}"></script>
  </body>
</html>
  `
  );
  res.end();
};
