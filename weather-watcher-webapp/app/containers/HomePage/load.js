import dbReducer from 'app/containers/Database/reducer';
import dbSagas from 'app/containers/Database/sagas';
import {getAsyncInjectors} from 'app/utils/asyncInjectors';
import HomePage from '.';
import reducer from './reducer';
import sagas from './sagas';

let loaded = false;

export default function load({store}) {
  if (!loaded) {
    loaded = true;
    const {injectReducer, injectSagas} = getAsyncInjectors(store);
    injectReducer('home', reducer);
    injectSagas(sagas);

    injectReducer('database', dbReducer);
    injectSagas(dbSagas);
  }
  return HomePage;
}
