import {delay} from 'redux-saga';
import {take, takeEvery, call, put, select, all} from 'redux-saga/effects';
import moment from 'moment-mini';

import {NOAAClient} from 'app/noaa';
import {
  CREATE_COMPARISON_POINT,
  FETCH_NOAA_POINT,
  FETCH_NOAA_FORECAST,
  RECEIVE_NOAA_POINT,
  REFRESH_COMPARISON_POINT,
} from './constants';
import {
  receiveNOAAPoint,
  receiveNOAAForecast,
  fetchNOAAPoint,
  updateComparisonPoint,
  fetchNOAAForecast,
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

export function* refreshComparisonPoint({comparisonPointId}) {
  let allPoints = yield select(selectComparisonPoints());
  let comparisonPoint = allPoints.get(comparisonPointId);
  if (!comparisonPoint) {
    return;
  }
  if (!comparisonPoint.noaaPointId) {
    yield call(createComparisonPoint, {comparisonPoint});
    allPoints = yield select(selectComparisonPoints());
    comparisonPoint = allPoints.get(comparisonPointId);
  }
  if (comparisonPoint.noaaPointId) {
    const allNOAAPoints = yield select(selectNOAAPoints());
    const noaaPoint = allNOAAPoints.get(comparisonPoint.noaaPointId);
    if (noaaPoint) {
      yield all([
        call(refreshForecast, {
          forecastType: 'grid',
          forecastId: noaaPoint.properties.forecastGridData,
        }),
        call(refreshForecast, {
          forecastType: 'hourly',
          forecastId: noaaPoint.properties.forecastHourly,
        }),
        call(refreshForecast, {
          forecastType: 'daily',
          forecastId: noaaPoint.properties.forecast,
        }),
      ]);
    }
  }
}

export function* watchFetchNOAAPoint() {
  yield takeEvery(FETCH_NOAA_POINT, function*({
    latitude,
    longitude,
    comparisonPointId,
  }) {
    const noaaPoint = yield call(NOAAClient.fetchNOAAPoint, {
      latitude,
      longitude,
    });
    yield put(receiveNOAAPoint({noaaPoint, latitude, longitude}));
    if (comparisonPointId) {
      const [lng, lat] = noaaPoint.geometry.coordinates;
      yield put(
        updateComparisonPoint({
          id: comparisonPointId,
          latitude: lat,
          longitude: lng,
          noaaPointId: noaaPoint.id,
          noaaGridForecastId: noaaPoint.properties.forecastGridData,
          noaaDailyForecastId: noaaPoint.properties.forecast,
          noaaHourlyForecastId: noaaPoint.properties.forecastHourly,
        })
      );
    }
    yield all([
      call(refreshForecast, {
        forecastType: 'grid',
        forecastId: noaaPoint.properties.forecastGridData,
      }),
      call(refreshForecast, {
        forecastType: 'hourly',
        forecastId: noaaPoint.properties.forecastHourly,
      }),
      call(refreshForecast, {
        forecastType: 'daily',
        forecastId: noaaPoint.properties.forecast,
      }),
    ]);
  });
}

export function* watchFetchNOAAForecast() {
  yield takeEvery(FETCH_NOAA_FORECAST, function*({
    forecastType,
    forecastId,
  }) {
    const forecast = yield call(NOAAClient.fetch, forecastId);
    yield put(receiveNOAAForecast({forecastId, forecast, forecastType}));
  });
}

export function* createComparisonPoint({comparisonPoint}) {
  yield put(
    fetchNOAAPoint({
      latitude: comparisonPoint.latitude,
      longitude: comparisonPoint.longitude,
      comparisonPointId: comparisonPoint.id,
    })
  );
}

export function* watchCreateComparisonPoint() {
  yield takeEvery(CREATE_COMPARISON_POINT, createComparisonPoint);
}

export function* watchRefreshComparisonPoint() {
  yield takeEvery(REFRESH_COMPARISON_POINT, refreshComparisonPoint);
}

// All sagas to be loaded
export default [
  watchFetchNOAAPoint,
  watchFetchNOAAForecast,
  watchCreateComparisonPoint,
  watchRefreshComparisonPoint,
];
