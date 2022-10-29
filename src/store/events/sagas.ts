import {
  all,
  call,
  delay,
  put,
  select,
  takeLatest,
  race,
  take,
} from 'redux-saga/effects';
import * as _ from 'lodash';

import { eventsActions, eventsSelector } from '$store/events/index';
import { walletActions, walletAddressSelector, walletSelector } from '$store/wallet';
import { batchActions } from '$store';
import { EventsMap, LoadEventsAction } from '$store/events/interface';
import { getWalletName } from '$shared/dynamicConfig';
import { EventsManager } from '$store/events/manager';
import { debugLog } from '$utils';
import { jettonsActions } from '$store/jettons';
import { reloadSubscriptionsFromServer } from '$store/subscriptions/sagas';

let manager: EventsManager | null;

export function destroyEventsManager() {
  manager = null;
}

// function* loadBtcMempoolTransactions(address: string) {
//   try {
//     const resp = yield withRetry(
//       'loadBtcMempoolTransactions',
//       axios.get,
//       `${getServerConfig('bitcoinEndpoint')}/address/${address}/txs/mempool`,
//     );
//
//     if (resp.data) {
//       const txs = resp.data.map((item: any) => {
//         const tx = parseBtcTransactions(address, item);
//         tx.timestamp = getUnixTime(new Date());
//         return tx;
//       });
//
//       yield put(
//         transactionsActions.setTransactions({
//           transactions: txs,
//           isReplace: false,
//         }),
//       );
//     }
//   } catch (e) {
//     console.log('ton ERR', e.message);
//   }
//
//   return [];
// }

function* loadEventsWorker(action: LoadEventsAction) {
  try {
    const { wallet } = yield select(walletSelector);
    if (!wallet) {
      return;
    }

    if (!manager || action.payload.isReplace) {
      manager = new EventsManager({
        walletName: getWalletName(),
        address: yield call([wallet.ton, 'getAddress']),
      });
    }

    const { eventsInfo } = yield select(eventsSelector);
    if (_.isEmpty(eventsInfo)) {
      // build transactions from cache
      yield put(
        batchActions(
          eventsActions.setEvents({
            events: yield call([manager, 'build'], action.payload.ignoreCache),
            isReplace: true,
            isFromCache: true,
          }),
          eventsActions.setCanLoadMore(yield call([manager, 'canLoadMore'])),
        ),
      );
    }

    // load new events
    yield put(
      batchActions(
        eventsActions.setEvents({
          events: yield call([manager, 'fetch'], action.payload.ignoreCache),
          isReplace: true,
        }),
        eventsActions.setCanLoadMore(yield call([manager, 'canLoadMore'])),
      ),
    );
  } catch (e) {
    e && debugLog(e.message);
    console.log('ERR', e);
  }
}

export function* pollEventsStatusWatchWorker() {
  yield race({
    task: call(pollEventsWorker),
    cancel: take(eventsActions.cancelPollEvents),
    timeout: delay(60000),
  });
}

function* pollEventsWorker() {
  try {
    yield delay(500);
    while (true) {
      yield put(
        eventsActions.loadEvents({
          isReplace: true,
          isSilent: true,
        }),
      );
      yield delay(3000);
      const { eventsInfo } = yield select(eventsSelector);
      const pendingEvent = Object.values(eventsInfo as EventsMap).find((transaction) => {
        return transaction.inProgress;
      });
      if (!pendingEvent) {
        const address = yield select(walletAddressSelector);
        yield call(reloadSubscriptionsFromServer, address.ton);
        yield put(jettonsActions.loadJettons());
        yield put(walletActions.loadBalances());
        yield put(eventsActions.cancelPollEvents());
      }
    }
  } catch (e) {}
}

export function* eventsSaga() {
  yield all([
    takeLatest(eventsActions.loadEvents, loadEventsWorker),
    takeLatest(eventsActions.pollEvents, pollEventsStatusWatchWorker),
  ]);
}
