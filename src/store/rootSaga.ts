import { all } from 'redux-saga/effects';

import { mainSaga } from './main/sagas';
import { walletSaga } from './wallet/sagas';
import { ratesSaga } from './rates/sagas';
import { eventsSaga } from './events/sagas';
import { subscriptionsSaga } from './subscriptions/sagas';
import { exchangeSaga } from './exchange/sagas';
import { nftsSaga } from '$store/nfts/sagas';
import { jettonsSaga } from '$store/jettons/sagas';
import { favoritesSaga } from './favorites/sagas';

export function* rootSaga() {
  yield all([
    mainSaga(),
    walletSaga(),
    ratesSaga(),
    eventsSaga(),
    subscriptionsSaga(),
    exchangeSaga(),
    nftsSaga(),
    jettonsSaga(),
    favoritesSaga(),
  ]);
}
