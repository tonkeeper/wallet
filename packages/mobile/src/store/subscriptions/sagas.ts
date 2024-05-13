import { all, takeLatest, call, select } from 'redux-saga/effects';

import { actions as subscriptionsActions } from '$store/subscriptions/index';
import { SubscribeAction, UnsubscribeAction } from '$store/subscriptions/interface';
import { walletWalletSelector } from '$store/wallet';
import { CryptoCurrencies } from '$shared/constants';
import { Toast } from '$store';
import { fuzzifyNumber } from '$utils';
import { Ton } from '$libs/Ton';
import { network } from '$libs/network';
import { trackEvent } from '$utils/stats';
import { tk } from '$wallet';
import { config } from '$config';

function* subscribeWorker(action: SubscribeAction) {
  const { subscription, onDone, onFail } = action.payload;

  try {
    const wallet = yield select(walletWalletSelector);
    const prepared = yield call(
      [wallet.ton, 'createSubscription'],
      subscription.address,
      subscription.amountNano,
      subscription.intervalSec,
      subscription.subscriptionId,
    );

    const currency = CryptoCurrencies.Ton;

    const host = config.get('subscriptionsHost');
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
    const wallet = yield select(walletWalletSelector);
    const signedTx = yield call(
      [wallet.ton, 'getCancelSubscriptionBoc'],
      subscription.subscriptionAddress,
    );

    const host = config.get('subscriptionsHost');
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
    takeLatest(subscriptionsActions.subscribe, subscribeWorker),
    takeLatest(subscriptionsActions.unsubscribe, unsubscribeWorker),
  ]);
}
