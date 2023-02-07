import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import * as _ from 'lodash';

import { nftsActions, nftsSelector } from '$store/nfts/index';
import { walletSelector } from '$store/wallet';
import { batchActions } from '$store';
import { LoadNFTAction, LoadNFTsAction } from '$store/nfts/interface';
import { getWalletName } from '$shared/dynamicConfig';
import { NFTsManager } from '$store/nfts/manager';
import { checkIsTonDiamondsNFT, debugLog } from '$utils';
import { Api } from '$api';
import { MarketplaceModel, NFTModel } from '$store/models';
import { mainActions, mainSelector } from '$store/main';
import { AccentKey } from '$styled';
import { getIsTestnet } from '$database';
import { withRetry } from '$store/retry';
import axios from 'axios';
import { getServerConfig } from '$shared/constants';
import { i18n } from '$translation';
import DeviceInfo from 'react-native-device-info';
import FastImage from 'react-native-fast-image';

let manager: NFTsManager | null;

export function destroyTransactionManager() {
  manager = null;
}

function* loadNFTsWorker(action: LoadNFTsAction) {
  try {
    const { wallet } = yield select(walletSelector);
    if (!wallet) {
      yield put(nftsActions.setIsLoading(false));
      return;
    }

    if (!manager || action.payload.isReplace) {
      manager = new NFTsManager({
        walletName: getWalletName(),
        tonAddresses: yield call([wallet.ton, 'getAllAddresses']),
      });
    }

    const { myNfts } = yield select(nftsSelector);
    if (_.isEmpty(myNfts)) {
      let nfts = yield call([manager, 'fromCache']);
      // build nfts from cache
      yield put(
        batchActions(
          nftsActions.setNFTs({
            nfts,
            isReplace: true,
            isFromCache: true,
          }),
          nftsActions.setCanLoadMore(yield call([manager, 'canLoadMore'])),
        ),
      );
    }

    let nfts = yield call([manager, 'fetch']);
    // load new nfts
    yield put(
      nftsActions.setNFTs({
        nfts,
        isReplace: true,
      }),
    );
    yield put(nftsActions.setCanLoadMore(yield call([manager, 'canLoadMore'])));
  } catch (e) {
    e && debugLog(e.message);
    console.log('ERR', e);
  }
}

function* loadNFTWorker(action: LoadNFTAction) {
  try {
    const { wallet } = yield select(walletSelector);
    if (!wallet) {
      yield put(nftsActions.setIsLoading(false));
      return;
    }
    if (!manager) {
      manager = new NFTsManager({
        walletName: getWalletName(),
        tonAddresses: yield call([wallet.ton, 'getAllAddresses']),
      });
    }

    // load new nfts
    yield put(
      batchActions(
        nftsActions.setNFT({
          nft: yield call([manager, 'fetchNFTItem'], action.payload.address),
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
      feature: 'nfts_tab',
    },
  });
  yield put(nftsActions.setIsEnabled(featureEnabled?.enabled ?? false));
}

function* setNFTsWorker() {
  try {
    const { tonCustomIcon } = yield select(mainSelector);

    if (!tonCustomIcon) {
      return;
    }

    const { myNfts } = yield select(nftsSelector);
    const diamondsNFTs = Object.values(myNfts as NFTModel[]).filter(
      checkIsTonDiamondsNFT,
    );

    const hasNFTForSelectedIcon = diamondsNFTs.some(
      (nft) => nft.metadata.image_diamond === tonCustomIcon?.uri,
    );

    if (!hasNFTForSelectedIcon) {
      yield put(mainActions.setAccent(AccentKey.default));
      yield put(mainActions.setTonCustomIcon(null));
    }
  } catch (e) {}
}

export function* loadMarketplacesWorker() {
  try {
    const isTestnet = yield call(getIsTestnet);
    const resp = yield withRetry(
      'loadMarketplacesWorker',
      axios.get,
      `${getServerConfig('tonkeeperEndpoint')}/marketplaces`,
      {
        params: {
          lang: i18n.locale,
          build: DeviceInfo.getReadableVersion(),
          chainName: isTestnet ? 'testnet' : 'mainnet',
        },
      },
    );
    const marketplaces: MarketplaceModel[] = resp?.data?.data?.marketplaces || [];

    FastImage.preload(
      marketplaces.map((marketplace) => ({ uri: marketplace.marketplace_url })),
    );

    yield put(nftsActions.setLoadedMarketplaces(marketplaces));
  } catch (e) {}
}

export function* nftsSaga() {
  yield all([
    takeLatest(nftsActions.loadNFTs, loadNFTsWorker),
    takeEvery(nftsActions.loadNFT, loadNFTWorker),
    takeLatest(nftsActions.getIsFeatureEnabled, getIsFeatureEnabledWorker),
    takeEvery(nftsActions.setNFTs, setNFTsWorker),
    takeEvery(nftsActions.loadMarketplaces, loadMarketplacesWorker),
  ]);
}
