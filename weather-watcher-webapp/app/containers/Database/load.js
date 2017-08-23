import {getAsyncInjectors} from 'app/utils/asyncInjectors';
import sagas from './sagas';

let loaded = false;

export default function load({store}) {
  if (!loaded) {
    loaded = true;
    const {injectReducer, injectSagas} = getAsyncInjectors(store);
    injectSagas(sagas);
  }
}
