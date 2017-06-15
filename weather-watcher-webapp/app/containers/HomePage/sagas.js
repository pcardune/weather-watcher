/**
 * Gets the repositories of the user from Github
 */

import {
  apply,
  take,
  call,
  put,
  select,
  cancel,
  takeLatest,
} from 'redux-saga/effects';
import {LOCATION_CHANGE} from 'react-router-redux';
import {LOAD_REPOS} from 'containers/App/constants';
import {reposLoaded, repoLoadingError} from 'containers/App/actions';

import {Comparison} from 'weather-watcher-core';

import request from 'utils/request';
import {makeSelectUsername} from 'containers/HomePage/selectors';

import {DEFAULT_COMPARISON_DATA, REFRESH_COMPARISON} from './constants';
import {receiveComparison} from './actions';

/**
 * Github repos request/response handler
 */
export function* getRepos() {
  // Select username from store
  const username = yield select(makeSelectUsername());
  const requestURL = `https://api.github.com/users/${username}/repos?type=all&sort=updated`;

  try {
    // Call our request helper (see 'utils/request')
    const repos = yield call(request, requestURL);
    yield put(reposLoaded(repos, username));
  } catch (err) {
    yield put(repoLoadingError(err));
  }
}

export function* fetchComparison() {
  const cached = localStorage.getItem('comparisonCache');
  let comparisonData = DEFAULT_COMPARISON_DATA;
  if (cached) {
    try {
      comparisonData = JSON.parse(cached);
    } catch (e) {
      // just leave it as the default
    }
  }
  const comparison = Comparison.fromJSON(comparisonData);
  yield apply(comparison, comparison.fetch);
  localStorage.setItem('comparisonCache', JSON.stringify(comparison.toJSON()));
  yield put(receiveComparison(comparison));
}

export function* comparisonSaga() {
  yield takeLatest(REFRESH_COMPARISON, fetchComparison);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* githubData() {
  // Watches for LOAD_REPOS actions and calls getRepos when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  const watcher = yield takeLatest(LOAD_REPOS, getRepos);

  // Suspend execution until location changes
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

// Bootstrap sagas
export default [githubData, comparisonSaga];
