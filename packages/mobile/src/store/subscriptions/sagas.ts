import { all, takeLatest, call, put, select, fork } from 'redux-saga/effects';

import { subscriptionsActions } from '$store/subscriptions/index';
import { SubscribeAction, UnsubscribeAction } from '$store/subscriptions/interface';
import { toastActions } from '$store/toast';
import { walletSelector } from '$store/wallet';
import { Api } from '$api';
import { walletGetUnlockedVault } from '$store/wallet/sagas';
import { getSubscriptions, saveSubscriptions } from '$database';
import { SubscriptionModel } from '$store/models';
import { CryptoCurrencies } from '$shared/constants';
import { store } from '$store';
import { fuzzifyNumber, trackEvent } from '$utils';
import { Ton } from '$libs/Ton';
import { eventsActions } from '$store/events';

export async function reloadSubscriptionsFromServer(address: string) {
  try {
    const resp: any = await Api.get('/subscriptions', {
      params: { address },
    });
    store.dispatch(subscriptionsActions.setSubscriptionsInfo(resp));
    await saveSubscriptions(Object.values(resp));
  } catch {}
}

function* loadSubscriptionsWorker() {
  try {
    const { wallet } = yield select(walletSelector);
    if (!wallet) {
      return;
    }

    if (!wallet.ton.isV4()) {
      return;
    }

    yield fork(setSubscriptionsFromCache);
    //
    // const address = yield call([wallet.ton, 'getAddress']);
    // const resp = yield withRetry('loadSubscriptionsFromApi', Api.get, '/subscriptions', {
    //   params: { address },
    // });
    // yield put(subscriptionsActions.setSubscriptionsInfo(resp));
    // yield call(saveSubscriptions, Object.values(resp));
  } catch (e) {}
}

function* setSubscriptionsFromCache() {
  const subscriptions = yield call(getSubscriptions);
  const map: { [index: string]: SubscriptionModel } = {};
  for (let subscription of subscriptions) {
    map[subscription.subscriptionAddress] = subscription;
  }

  yield put(subscriptionsActions.setSubscriptionsInfo(map));
}

function* subscribeWorker(action: SubscribeAction) {
  const { subscription, onDone, onFail } = action.payload;

  try {
    const featureEnabled = yield call(Api.get, '/feature/enabled', {
      params: {
        feature: 'subscription',
      },
    });
    if (!featureEnabled.enabled) {
      throw new Error(featureEnabled.message);
    }

    const { wallet } = yield select(walletSelector);
    const unlockedVault = yield call(walletGetUnlockedVault);
    const prepared = yield call(
      [wallet.ton, 'createSubscription'],
      unlockedVault,
      subscription.address,
      subscription.amountNano,
      subscription.intervalSec,
      subscription.subscriptionId,
    );

    const currency = CryptoCurrencies.Ton;

    yield call(Api.post, `/subscribe/confirm/${subscription.id}`, {
      signed_tx: prepared.signedTx,
      wallet_address: prepared.walletAddress,
      subscription_address: prepared.subscriptionAddress,
      fee: prepared.fee,
      startAt: prepared.startAt,
    });

    yield put(eventsActions.pollEvents());
    onDone();

    yield call(trackEvent, 'subscription', {
      currency,
      amount: fuzzifyNumber(Ton.fromNano(subscription.amountNano)),
    });
  } catch (e) {
    console.log(e);
    yield put(toastActions.fail(e.message));
    onFail();
  }
}

function* unsubscribeWorker(action: UnsubscribeAction) {
  const { subscription, onDone, onFail } = action.payload;
  try {
    const { wallet } = yield select(walletSelector);
    const unlockedVault = yield call(walletGetUnlockedVault);
    const result = yield call(
      [wallet.ton, 'removeSubscription'],
      unlockedVault,
      subscription.subscriptionAddress,
    );
    yield put(eventsActions.pollEvents());
    onDone();
  } catch (e) {
    console.log(e);
    yield put(toastActions.fail(e.message));
    onFail();
  }
}

export function* subscriptionsSaga() {
  yield all([
    takeLatest(subscriptionsActions.loadSubscriptions, loadSubscriptionsWorker),
    takeLatest(subscriptionsActions.subscribe, subscribeWorker),
    takeLatest(subscriptionsActions.unsubscribe, unsubscribeWorker),
  ]);
}
