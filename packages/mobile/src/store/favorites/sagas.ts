import { all, takeLatest, put, call, select } from 'redux-saga/effects';

import { favoritesActions, favoritesSelector } from './index';
import {
  getFavorites,
  getHiddenRecentAddresses,
  saveFavorites,
  saveHiddenRecentAddresses,
} from '$database';
import { batchActions } from '$store';

function* loadSuggestsWorker() {
  const favorites = yield call(getFavorites);
  const hiddenRecentAddresses = yield call(getHiddenRecentAddresses);

  yield put(
    batchActions(
      favoritesActions.setFavorites(favorites),
      favoritesActions.setHiddenRecentAddresses(hiddenRecentAddresses),
    ),
  );
}

function* updateFavoritesWorker() {
  const { favorites } = yield select(favoritesSelector);

  yield call(saveFavorites, favorites);
}

function* updateHiddenRecentAddressesWorker() {
  const { hiddenRecentAddresses } = yield select(favoritesSelector);

  yield call(saveHiddenRecentAddresses, hiddenRecentAddresses);
}

export function* favoritesSaga() {
  yield all([takeLatest(favoritesActions.loadSuggests, loadSuggestsWorker)]);
  yield all([takeLatest(favoritesActions.updateFavorite, updateFavoritesWorker)]);
  yield all([takeLatest(favoritesActions.deleteFavorite, updateFavoritesWorker)]);
  yield all([
    takeLatest(favoritesActions.hideRecentAddress, updateHiddenRecentAddressesWorker),
  ]);
  yield all([
    takeLatest(favoritesActions.restoreHiddenAddress, updateHiddenRecentAddressesWorker),
  ]);
}
