import { all } from 'redux-saga/effects';

import { mainSaga } from './main/sagas';
import { walletSaga } from './wallet/sagas';
import { eventsSaga } from './events/sagas';
import { subscriptionsSaga } from './subscriptions/sagas';
import { nftsSaga } from '$store/nfts/sagas';
import { jettonsSaga } from '$store/jettons/sagas';
import { favoritesSaga } from './favorites/sagas';

export function* rootSaga() {
  yield all([
    mainSaga(),
    walletSaga(),
    eventsSaga(),
    subscriptionsSaga(),
    nftsSaga(),
    jettonsSaga(),
    favoritesSaga(),
  ]);
}
