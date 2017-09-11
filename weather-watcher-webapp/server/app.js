import fs from 'fs';
import path from 'path';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {Provider} from 'react-redux';
import {StaticRouter} from 'react-router';
import {ThemeProvider, ServerStyleSheet} from 'styled-components';
import {
  getDehydratedState,
  receiveSnapshots,
  getFirebaseMirror,
} from 'redux-firebase-mirror';
import Helmet from 'react-helmet';

import firebase from 'app/firebaseApp';
import App from 'app/containers/App';
import loadDatabase from 'app/containers/Database/load';
import {
  getForecastId,
  getGridForecastId,
  getForecastZoneId,
} from 'app/containers/Database/subscriptions';
import configureStore from 'app/store';
import {FB_APP_ID} from 'app/constants';
import firebaseStorageAPI from 'app/firebaseStorageAPI';

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
  ['comparisons', 'comparisonPoints', 'noaaAlerts'].forEach(rootPath => {
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
      `/noaaAlertsForecasts/${getForecastZoneId(noaaPoint)}`,
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
if (process.env.NODE_ENV === 'production') {
  getSharedStore().then(prefetchDataForStore);
} else {
  getSharedStore();
}

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
  //if (req.path === '/initialState.js') {
  //  const state = JSON.stringify({
  //    firebaseMirror: getDehydratedState(store.getState()),
  //  }).replace(/</g, '\\u003c');
  //  write('state', `window.REDUX_INITIAL_STATE = (${state});`);
  //  res.end();
  //  return;
  //}
  const context = {};
  const sheet = new ServerStyleSheet();
  firebaseStorageAPI.startRecording();
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
  const paths = firebaseStorageAPI.stopRecording();
  const dataToInject = {};
  paths.forEach(p => {
    dataToInject[p] = firebaseStorageAPI.getValueAtPath(
      getFirebaseMirror(store.getState()),
      p
    );
  });
  const mirror = firebaseStorageAPI.setValues(
    firebaseStorageAPI.getInitialMirror(),
    dataToInject
  );
  let dehydrated = getDehydratedState(store.getState());
  // TODO: a little hacky, relying on an implementation detail in redux-firebase-mirror
  dehydrated = {...dehydrated, mirror: mirror.toJS()};

  const helmet = Helmet.renderStatic();
  if (context.url) {
    res.writeHead(301, {
      Location: context.url,
    });
    res.end();
    return;
  }
  const pixelCode =
    process.env.NODE_ENV === 'production'
      ? `
    <!-- Facebook Pixel Code -->
    <script>
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '126948057955894'); // Insert your pixel ID here.
      fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=126948057955894&ev=PageView&noscript=1"
    /></noscript>
    <!-- DO NOT MODIFY -->
    <!-- End Facebook Pixel Code -->`
      : '';

  write(
    'body',
    `<!doctype html>
<html lang="en" ${helmet.htmlAttributes.toString()}>
<head>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta property="og:url" content="https://www.goldilocksweather.com${req.originalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${context.title || ''}" />
  <meta property="og:description" content="${context.description || ''}" />
  <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/weather-watcher-170701.appspot.com/o/_DSC7469.jpg?alt=media&token=22b1912e-f922-41ea-a38c-bd921256ca02" />
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
  ${helmet.title.toString()}
  ${helmet.meta.toString()}
  ${helmet.link.toString()}
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAK8WIt0WlA2L-e7Hpqmri9b-dZwhyNbEk&libraries=places"></script>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.1.0/dist/leaflet.css"
    integrity="sha512-wcw6ts8Anuw10Mzh9Ytw4pylW8+NAD4ch3lqm9lzAsTxg0GFeJgoAtxuCLREZSC5lUXdVyo/7yfsqFjQ4S+aKw=="
    crossOrigin=""
  />

  <script>
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '${FB_APP_ID}',
        cookie     : true,
        xfbml      : true,
        version    : 'v2.10'
      });
      ${process.env.NODE_ENV === 'production'
        ? 'FB.AppEvents.logPageView();'
        : ''}
      if (window.afterFBLoaded) {
        window.afterFBLoaded(FB);
      }
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  </script>
  ${pixelCode}

  <style>
    html,
    body {
      height: 100%;
      width: 100%;
      line-height: 1.5;
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
  <body ${helmet.bodyAttributes.toString()}>
    <noscript>
      If you're seeing this message, that means
      <strong>JavaScript has been disabled on your browser</strong>, please
      <strong>enable JS</strong> to make this app work.
    </noscript>
    <div
      id="app"
      class="grey lighten-3"
    >${main}</div>
    <link
      href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700"
      rel="stylesheet"
    />
    ${process.env.NODE_ENV === 'development'
      ? '<script src="/reactBoilerplateDeps.dll.js"></script>'
      : ''}

    <script>window.REDUX_INITIAL_STATE = (${JSON.stringify({
      firebaseMirror: dehydrated,
    }).replace(/</g, '\\u003c')});</script>
    <script src="${getAssetPath('main.js')}"></script>
  </body>
</html>
  `
  );
  res.end();
};
