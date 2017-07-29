/**
 * Create the store with asynchronously loaded reducers
 */

import {createStore, applyMiddleware, compose} from 'redux';
import {fromJS} from 'immutable';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import {persistStore, autoRehydrate} from 'redux-persist-immutable';
import localForage from 'localforage';
import createReducer from './reducers';

const sagaMiddleware = createSagaMiddleware();

const PERSIST = false;

export default function configureStore(initialState = {}, callback) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  const middlewares = [sagaMiddleware, thunkMiddleware];

  const enhancers = [applyMiddleware(...middlewares)];
  if (PERSIST) {
    enhancers.push(autoRehydrate());
  }

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;
  /* eslint-enable */

  const store = createStore(
    createReducer(),
    fromJS(initialState),
    composeEnhancers(...enhancers)
  );

  // Extensions
  store.runSaga = sagaMiddleware.run;
  store.asyncReducers = {}; // Async reducer registry

  if (PERSIST) {
    persistStore(
      store,
      {blacklist: ['firebaseMirror'], storage: localForage},
      () => callback(store)
    );
  } else {
    callback(store);
  }

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      import('./reducers').then(reducerModule => {
        const createReducers = reducerModule.default;
        const nextReducers = createReducers(store.asyncReducers);

        store.replaceReducer(nextReducers);
      });
    });
  }

  return store;
}
