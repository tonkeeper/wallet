import { all } from 'redux-saga/effects';

import { mainSaga } from './main/sagas';
import { walletSaga } from './wallet/sagas';
import { subscriptionsSaga } from './subscriptions/sagas';
import { favoritesSaga } from './favorites/sagas';

export function* rootSaga() {
  yield all([mainSaga(), walletSaga(), subscriptionsSaga(), favoritesSaga()]);
}
