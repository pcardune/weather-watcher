import {take, takeEvery, call, put, select, fork} from 'redux-saga/effects';
import moment from 'moment-mini';

import {NOAAClient} from 'app/noaa';
import {
  CREATE_COMPARISON_POINT,
  FETCH_NOAA_POINT,
  FETCH_NOAA_GRID_FORECAST,
  FETCH_NOAA_FORECAST,
  RECEIVE_NOAA_POINT,
} from './constants';
import {
  receiveNOAAPoint,
  receiveNOAAGridForecast,
  receiveNOAAForecast,
  fetchNOAAPoint,
  fetchNOAAForecast,
  fetchNOAAGridForecast,
  updateComparisonPoint,
} from './actions';

import {
  selectNOAADailyForecasts,
  selectNOAAHourlyForecasts,
  selectNOAAGridForecasts,
  selectComparisonPoints,
  selectNOAAPoints,
} from './selectors';

export function* refreshForecast({forecastType, forecastId}) {
  const selector = {
    grid: selectNOAAGridForecasts,
    daily: selectNOAADailyForecasts,
    hourly: selectNOAAHourlyForecasts,
  }[forecastType];
  const allForecasts = yield select(selector());
  const forecasts = allForecasts.get(forecastId);
  const lastForecastUpdate = forecasts && forecasts.keySeq().get(-1);
  if (
    !lastForecastUpdate ||
    moment(new Date(lastForecastUpdate)).isBefore(
      moment(new Date()).subtract(12, 'hours')
    )
  ) {
    yield put(fetchNOAAForecast({forecastId, forecastType}));
  }
}

export function* refreshComparisonPoint(comparisonPointId) {
  let allPoints = yield select(selectComparisonPoints());
  let comparisonPoint = allPoints.get(comparisonPointId);
  if (!comparisonPoint) {
    return;
  }
  if (!comparisonPoint.noaaPointId) {
    yield fork(createComparisonPoint, {comparisonPoint});
    allPoints = yield select(selectComparisonPoints());
    comparisonPoint = allPoints.get(comparisonPointId);
  }
  if (comparisonPoint.noaaPointId) {
    const allNOAAPoints = yield select(selectNOAAPoints());
    const noaaPoint = allNOAAPoints.get(comparisonPoint.noaaPointId);
    if (noaaPoint) {
      yield fork(refreshForecast, {
        forecastType: 'grid',
        forecastId: noaaPoint.properties.forecastGridData,
      });
      yield fork(refreshForecast, {
        forecastType: 'hourly',
        forecastId: noaaPoint.properties.forecastHourly,
      });
      yield fork(refreshForecast, {
        forecastType: 'daily',
        forecastId: noaaPoint.properties.forecast,
      });
    }
  }
}

export function* watchFetchNOAAPoint() {
  yield takeEvery(FETCH_NOAA_POINT, function*({latitude, longitude}) {
    const noaaPoint = yield call(NOAAClient.fetchNOAAPoint, {
      latitude,
      longitude,
    });
    yield put(receiveNOAAPoint({noaaPoint}));
    yield put(fetchNOAAGridForecast({noaaPoint}));
    yield put(fetchNOAAForecast({noaaPoint, forecastType: 'daily'}));
    yield put(fetchNOAAForecast({noaaPoint, forecastType: 'hourly'}));
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

export function* watchFetchNOAAForecast() {
  yield takeEvery(FETCH_NOAA_FORECAST, function*({forecastType, forecastId}) {
    const forecast = yield call(NOAAClient.fetch, forecastId);
    yield put(receiveNOAAForecast({forecastId, forecast, forecastType}));
  });
}

export function* createComparisonPoint({comparisonPoint}) {
  yield put(fetchNOAAPoint(comparisonPoint));
  const receiveAction = yield take(RECEIVE_NOAA_POINT);
  yield put(
    updateComparisonPoint({
      id: comparisonPoint.id,
      noaaPointId: receiveAction.noaaPoint.id,
      noaaGridForecastId: receiveAction.noaaPoint.properties.forecastGridData,
      noaaDailyForecastId: receiveAction.noaaPoint.properties.forecast,
      noaaHourlyForecastId: receiveAction.noaaPoint.properties.forecastHourly,
    })
  );
}

export function* watchCreateComparisonPoint() {
  yield takeEvery(CREATE_COMPARISON_POINT, createComparisonPoint);
}

// All sagas to be loaded
export default [
  watchFetchNOAAPoint,
  watchFetchNOAAGridForecast,
  watchFetchNOAAForecast,
  watchCreateComparisonPoint,
];
