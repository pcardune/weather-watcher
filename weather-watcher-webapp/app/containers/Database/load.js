import {getAsyncInjectors} from 'app/utils/asyncInjectors';
import firebase from 'app/firebaseApp';

import sagas from './sagas';
import reducer from './reducer';
import {LOGIN_USER, LOGOUT_USER} from './constants';

let loaded = false;

export default function load({store}) {
  if (!loaded) {
    loaded = true;
    const {injectReducer, injectSagas} = getAsyncInjectors(store);

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        //var isAnonymous = user.isAnonymous;
        //var uid = user.uid;
        store.dispatch({type: LOGIN_USER, user});
      } else {
        // User is signed out.
        store.dispatch({type: LOGOUT_USER});
      }
    });
    injectReducer('database', reducer);
    injectSagas(sagas);
  }
}
