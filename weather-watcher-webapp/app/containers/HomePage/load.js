import loadDatabase from 'app/containers/Database/load';
import {getAsyncInjectors} from 'app/utils/asyncInjectors';
import HomePage from '.';
import reducer from './reducer';
import sagas from './sagas';

let loaded = false;

export default function load({store}) {
  if (!loaded) {
    loaded = true;
    loadDatabase({store});
    const {injectReducer, injectSagas} = getAsyncInjectors(store);
    injectReducer('home', reducer);
    //injectSagas(sagas);
  }
  return HomePage;
}
