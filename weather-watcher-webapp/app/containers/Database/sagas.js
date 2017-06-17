import {take, takeEvery, call, put} from 'redux-saga/effects';
import {NOAAClient} from 'app/noaa';
import {
  CREATE_COMPARISON_POINT,
  FETCH_NOAA_POINT,
  FETCH_NOAA_GRID_FORECAST,
  RECEIVE_NOAA_POINT,
} from './constants';
import {
  receiveNOAAPoint,
  receiveNOAAGridForecast,
  fetchNOAAPoint,
  fetchNOAAGridForecast,
  updateComparisonPoint,
} from './actions';

export function* watchFetchNOAAPoint() {
  yield takeEvery(FETCH_NOAA_POINT, function*({latitude, longitude}) {
    const noaaPoint = yield call(NOAAClient.fetchNOAAPoint, {
      latitude,
      longitude,
    });
    yield put(receiveNOAAPoint({noaaPoint}));
    yield put(fetchNOAAGridForecast({noaaPoint}));
  });
}

export function* watchFetchNOAAGridForecast() {
  yield takeEvery(FETCH_NOAA_GRID_FORECAST, function*({noaaPoint}) {
    const noaaGridForecast = yield call(
      NOAAClient.fetch,
      noaaPoint.properties.forecastGridData
    );
    yield put(receiveNOAAGridForecast({noaaGridForecast}));
  });
}

export function* watchCreateComparisonPoint() {
  yield takeEvery(CREATE_COMPARISON_POINT, function*(createAction) {
    yield put(fetchNOAAPoint(createAction.comparisonPoint));
    const receiveAction = yield take(RECEIVE_NOAA_POINT);
    yield put(
      updateComparisonPoint({
        id: createAction.comparisonPoint.id,
        noaaPointId: receiveAction.noaaPoint.id,
        noaaGridForecastId: receiveAction.noaaPoint.properties.forecastGridData,
      })
    );
  });
}

// All sagas to be loaded
export default [
  watchFetchNOAAPoint,
  watchFetchNOAAGridForecast,
  watchCreateComparisonPoint,
];
