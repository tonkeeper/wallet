import { all, takeLatest, call, put, select, fork } from 'redux-saga/effects';

import { subscriptionsActions } from '$store/subscriptions/index';
import { SubscribeAction, UnsubscribeAction } from '$store/subscriptions/interface';
import { walletSelector } from '$store/wallet';
import { Api } from '$api';
import { walletGetUnlockedVault } from '$store/wallet/sagas';
import { getSubscriptions, saveSubscriptions } from '$database';
import { SubscriptionModel } from '$store/models';
import { CryptoCurrencies, getServerConfig } from '$shared/constants';
import { store, Toast } from '$store';
import { fuzzifyNumber } from '$utils';
import { Ton } from '$libs/Ton';
import { network } from '$libs/network';
import { trackEvent } from '$utils/stats';
import { tk } from '@tonkeeper/shared/tonkeeper';

export async function reloadSubscriptionsFromServer(address: string) {
  try {
    const host = getServerConfig('subscriptionsHost');
    const resp = await network.get(`${host}/v1/subscriptions`, {
      params: { address },
    });
    if (!resp.data.data) {
      return;
    }
    store.dispatch(subscriptionsActions.setSubscriptionsInfo(resp.data.data));
    await saveSubscriptions(Object.values(resp.data.data));
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

    const host = getServerConfig('subscriptionsHost');
    yield call(network.post, `${host}/v1/subscribe/confirm/${subscription.id}`, {
      params: {
        signed_tx: prepared.signedTx,
        wallet_address: prepared.walletAddress,
        subscription_address: prepared.subscriptionAddress,
        fee: prepared.fee,
        startAt: prepared.startAt,
      },
    });

    yield call([tk.wallet.activityList, 'reload']);
    onDone();

    yield call(trackEvent, 'subscription', {
      currency,
      amount: fuzzifyNumber(Ton.fromNano(subscription.amountNano)),
    });
  } catch (e) {
    console.log(e);
    yield call(Toast.fail, e.message);
    onFail();
  }
}

function* unsubscribeWorker(action: UnsubscribeAction) {
  const { subscription, onDone, onFail } = action.payload;
  try {
    const { wallet } = yield select(walletSelector);
    const unlockedVault = yield call(walletGetUnlockedVault);
    const signedTx = yield call(
      [wallet.ton, 'getCancelSubscriptionBoc'],
      unlockedVault,
      subscription.subscriptionAddress,
    );

    const host = getServerConfig('subscriptionsHost');
    yield call(network.post, `${host}/v1/subscribe/cancel/${subscription.id}`, {
      params: { signed_tx: signedTx },
    });

    yield call([tk.wallet.activityList, 'reload']);
    onDone();
  } catch (e) {
    console.log(e);
    yield call(Toast.fail, e.message);
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
