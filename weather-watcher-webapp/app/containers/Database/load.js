import {getAsyncInjectors} from 'app/utils/asyncInjectors';
import reducer from './reducer';
import sagas from './sagas';

let loaded = false;

export default function load({store}) {
  if (!loaded) {
    loaded = true;
    const {injectReducer, injectSagas} = getAsyncInjectors(store);
    injectReducer('database', reducer);
    injectSagas(sagas);
  }
}
