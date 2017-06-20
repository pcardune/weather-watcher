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
    yield call(fetchNOAAForecast, {forecastId, forecastType});
  }
}

export function* refreshComparisonPoint({comparisonPointId}) {
  let allPoints = yield select(selectComparisonPoints());
  let comparisonPoint = allPoints.get(comparisonPointId);
  if (!comparisonPoint || comparisonPoint.isRefreshing) {
    return;
  }
  yield put(updateComparisonPoint({...comparisonPoint, isRefreshing: true}));
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
      yield put(
        updateComparisonPoint({...comparisonPoint, isRefreshing: false})
      );
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

export function* fetchNOAAForecast({forecastType, forecastId}) {
  const forecast = yield call(NOAAClient.fetch, forecastId);
  yield put(receiveNOAAForecast({forecastId, forecast, forecastType}));
}

export function* watchFetchNOAAForecast() {
  yield takeEvery(FETCH_NOAA_FORECAST, fetchNOAAForecast);
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
