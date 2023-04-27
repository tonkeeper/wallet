import { all, call, put, select, takeLatest, takeEvery } from 'redux-saga/effects';

import { nftsActions } from '$store/nfts/index';
import { walletSelector } from '$store/wallet';
import { batchActions } from '$store';
import { getWalletName } from '$shared/dynamicConfig';
import { JettonsManager } from '$store/jettons/manager';
import { debugLog } from '$utils';
import { jettonsActions, jettonsSelector } from '$store/jettons/index';
import { JettonsDB, MainDB } from '$database';
import {
  LoadJettonMetaAction,
  SwitchExcludedJettonAction,
} from '$store/jettons/interface';
import { Api } from '$api';
import _ from 'lodash';
import { JettonBalanceModel } from '$store/models';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';

let manager: JettonsManager | null;

export function destroyTransactionManager() {
  manager = null;
}

function* loadJettonMetaWorker(action: LoadJettonMetaAction) {
  try {
    const { wallet } = yield select(walletSelector);
    if (!wallet) {
      yield put(nftsActions.setIsLoading(false));
      return;
    }

    manager = new JettonsManager({
      walletName: getWalletName(),
      tonAddress: yield call([wallet.ton, 'getAddress']),
    });

    const meta = yield call([manager, 'fetchJettonMetadata'], action.payload);

    yield put(
      batchActions(
        jettonsActions.setJettonMetadata({
          jetton: { ...meta, jettonAddress: action.payload },
        }),
      ),
    );
  } catch (e) {
    e && debugLog(e.message);
    console.log('ERR', e);
  }
}

function* getIsFeatureEnabledWorker() {
  const featureEnabled = yield call(Api.get, '/feature/enabled', {
    params: {
      feature: 'jettons',
    },
  });
  yield put(jettonsActions.setIsEnabled(true));
}

function* switchExcludedJettonWorker(action: SwitchExcludedJettonAction) {
  const { excludedJettons } = yield select(jettonsSelector);
  let newExcludedJettons = _.clone(excludedJettons);
  newExcludedJettons[action.payload.jetton] = action.payload.value;
  yield put(jettonsActions.setExcludedJettons(newExcludedJettons));
  yield call(MainDB.setExcludedJettons, newExcludedJettons);
}

function* loadJettonsWorker() {
  try {
    const { wallet } = yield select(walletSelector);
    if (!wallet) {
      yield put(jettonsActions.setIsLoading(false));
      return;
    }

    manager = new JettonsManager({
      walletName: getWalletName(),
      tonAddress: yield call([wallet.ton, 'getAddress']),
    });

    const { jettonBalances } = yield select(jettonsSelector);
    const balances: JettonBalanceModel[] = yield call([manager, 'fetch']);

    // Move Token to pending if name or symbol changed
    jettonBalances.forEach((balance: JettonBalanceModel) => {
      const newBalance = balances.find((b) => b.jettonAddress === balance.jettonAddress);
      if (
        newBalance &&
        (balance.metadata.name !== newBalance.metadata.name ||
          balance.metadata.symbol !== newBalance.metadata.symbol)
      ) {
        useTokenApprovalStore.getState().actions.removeTokenStatus(balance.jettonAddress);
      }
    });

    yield put(
      batchActions(
        jettonsActions.setJettonBalances({
          jettonBalances: balances,
        }),
      ),
    );
    yield call(JettonsDB.saveJettons, balances);
  } catch (e) {
    e && debugLog(e.message);
    console.log('ERR', e);
  } finally {
    yield put(jettonsActions.setIsLoading(false));
  }
}

export function* jettonsSaga() {
  yield all([
    takeLatest(jettonsActions.loadJettons, loadJettonsWorker),
    takeLatest(jettonsActions.getIsFeatureEnabled, getIsFeatureEnabledWorker),
    takeEvery(jettonsActions.loadJettonMeta, loadJettonMetaWorker),
    takeEvery(jettonsActions.switchExcludedJetton, switchExcludedJettonWorker),
  ]);
}
