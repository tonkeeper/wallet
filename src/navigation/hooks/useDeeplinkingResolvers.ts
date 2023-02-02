import axios from 'axios';
import { Ton } from '$libs/Ton';
import { useDispatch } from 'react-redux';
import { useDeeplinking } from '$libs/deeplinking';
import { CryptoCurrencies } from '$shared/constants';
import { walletActions } from '$store/wallet';
import { Base64, compareAddresses, debugLog, isValidAddress } from '$utils';
import { store, Toast } from '$store';
import { TxRequest } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import {
  openCreateSubscription,
  openDeploy,
  openRequireWalletModal,
  openSend,
} from '../helper';

import { t } from '$translation';
import { getTimeSec } from '$utils/getTimeSec';
import { TonLoginClient } from '@tonapps/tonlogin-client';
import { useNavigation } from '$libs/navigation';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { isSignRawParams } from '$utils/isSignRawParams';
import { SignRawMessage } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { AppStackRouteNames } from '$navigation/navigationNames';
import { ModalName } from '$core/ModalContainer/ModalContainer.interface';
import { IConnectQrQuery, TonConnectRemoteBridge } from '$tonconnect';
import { openTimeNotSyncedModal } from '$core/ModalContainer/TimeNotSynced/TimeNotSynced';
import { openAddressMismatchModal } from '$core/ModalContainer/AddressMismatch/AddressMismatch';
import { openTonConnect } from '$core/TonConnect/TonConnectModal';

const getWallet = () => {
  return store.getState().wallet.wallet;
};

const getIsTimeSynced = () => {
  return store.getState().main.isTimeSynced;
};

const getExpiresSec = () => {
  return getTimeSec() + 10 * 60;
};

export function checkIsTimeSynced() {
  if (!getIsTimeSynced()) {
    openTimeNotSyncedModal();
    return false;
  }
  return true;
}

export function useDeeplinkingResolvers() {
  const deeplinking = useDeeplinking();
  const dispatch = useDispatch();
  const nav = useNavigation();

  deeplinking.setPrefixes([
    'ton://',
    'tonkeeper://',
    'https://app.tonkeeper.com',
    'https://tonhub.com',
  ]);

  deeplinking.addMiddleware((next) => {
    if (!getWallet()) {
      return openRequireWalletModal();
    }

    next();
  });

  deeplinking.add('/subscribe/:invoiceId', ({ params }) => {
    const wallet = getWallet();
    if (!wallet.ton.isV4()) {
      dispatch(walletActions.openMigration());
    } else {
      openCreateSubscription(params.invoiceId);
    }
  });

  deeplinking.add('/transfer/:address', ({ params, query, resolveParams }) => {
    const currency = CryptoCurrencies.Ton;
    const address = params.address;
    const comment = query.text ?? '';

    if (!isValidAddress(address)) {
      return Toast.fail(t('transfer_deeplink_address_error'));
    }

    if (query.amount && Number.isNaN(Number(query.amount))) {
      return Toast.fail(t('transfer_deeplink_amount_error'));
    }

    if (Number(query.amount) > 0) {
      const amount = Ton.fromNano(query.amount.toString());

      if (query.init || query.bin) {
        const message: SignRawMessage = {
          amount: query.amount,
          address,
        };

        if (query.init) {
          message.stateInit = query.init;
        }

        if (query.bin) {
          message.payload = query.bin;
        }

        openSignRawModal(
          {
            source: '',
            valid_until: getExpiresSec(),
            messages: [message],
          },
          {
            expires_sec: getExpiresSec(),
            response_options: {
              broadcast: false,
            },
          },
        );
      } else if (query.jetton) {
        if (!isValidAddress(query.jetton)) {
          return Toast.fail(t('transfer_deeplink_address_error'));
        }

        dispatch(
          walletActions.confirmSendCoins({
            currency,
            amount,
            address,
            comment,
            jettonWalletAddress: query.jetton,
            isJetton: true,
            onNext: (details) => {
              const options = {
                currency: query.jetton,
                address,
                comment,
                amount,
                fee: details.fee,
                isInactive: details.isInactive,
                isJetton: true,
              };

              nav.push(AppStackRouteNames.ModalContainer, {
                modalName: ModalName.CONFIRM_SENDING,
                key: 'CONFIRM_SENDING',
                ...options,
              });
            },
          }),
        );
      } else {
        dispatch(
          walletActions.confirmSendCoins({
            currency,
            amount,
            address,
            comment,
            onNext: (details) => {
              const options = {
                currency,
                address,
                comment,
                amount,
                fee: details.fee,
                isInactive: details.isInactive,
                withGoBack: resolveParams.withGoBack,
                methodId: resolveParams.methodId,
              };
              if (options.methodId) {
                nav.openModal('NewConfirmSending', options);
              } else {
                nav.push(AppStackRouteNames.ModalContainer, {
                  modalName: ModalName.CONFIRM_SENDING,
                  key: 'CONFIRM_SENDING',
                  ...options,
                  withGoBack: resolveParams.withGoBack ?? false,
                });
              }
            },
          }),
        );
      }
    } else if (query.jetton) {
      if (!isValidAddress(query.jetton)) {
        return Toast.fail(t('transfer_deeplink_address_error'));
      }
      openSend(query.jetton, address, comment, resolveParams.withGoBack, true);
    } else {
      openSend(currency, address, comment, false);
    }
  });

  deeplinking.add('/transfer', () => {
    openSend(CryptoCurrencies.Ton);
  });

  const resolveTxType = async (txRequest: TxRequest) => {
    const wallet = getWallet();
    if (txRequest?.version !== '0') {
      throw new Error('Wrong txrequest protocol');
    }

    const txBody = txRequest.body as any;
    const isSignRaw = isSignRawParams(txBody?.params);

    if (!checkIsTimeSynced()) {
      return Toast.hide();
    }

    if (
      txBody.expires_sec < getTimeSec() ||
      (isSignRaw && txBody.params.valid_until < getTimeSec())
    ) {
      throw new Error(t('nft_operations_expired'));
    }

    if (
      txBody.params.source &&
      isValidAddress(txBody.params.source) &&
      !compareAddresses(txBody.params.source, await wallet.ton.getAddress())
    ) {
      Toast.hide();
      return openAddressMismatchModal(
        () => resolveTxType(txRequest),
        txBody.params.source,
      );
    }

    switch (txRequest.body.type) {
      case 'nft-collection-deploy':
        nav.openModal('NFTCollectionDeploy', txBody);
        break;
      case 'nft-item-deploy':
        nav.openModal('NFTItemDeploy', txBody);
        break;
      case 'nft-single-deploy':
        nav.openModal('NFTSingleDeploy', txBody);
        break;
      case 'nft-change-owner':
        nav.openModal('NFTChangeOwner', txBody);
        break;
      case 'nft-transfer':
        nav.openModal('NFTTransfer', txBody);
        break;
      case 'nft-sale-place':
        nav.openModal('NFTSalePlace', txBody);
        break;
      case 'nft-sale-place-getgems':
        nav.openModal('NFTSalePlaceGetgems', txBody);
        break;
      case 'nft-sale-cancel':
        nav.openModal('NFTSaleCancel', txBody);
        break;
      case 'sign-raw-payload':
        const { params, ...options } = txBody;
        openSignRawModal(params, options);
        break;
      case 'deploy':
        openDeploy(txBody);
        break;
    }
  };

  deeplinking.add('/v1/txrequest-url/*', async ({ params }) => {
    try {
      Toast.loading();

      const { data } = await axios.get(`https://${params.path}`);
      if (!data) {
        throw new Error('Error JSON txrequest-url parsing');
      }

      if (data?.body?.type !== 'sign-raw-payload') {
        Toast.hide();
      }

      await resolveTxType(data);
    } catch (err) {
      let message = err?.message;
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as Record<string, any> | undefined;
        message = data?.error ?? t('error_network');
      }

      debugLog('[txrequest-url]', err);
      Toast.fail(message);
    }
  });

  deeplinking.add('/v1/txrequest-inline/*', async ({ params }) => {
    try {
      const txRequest = Base64.decodeToObj<TxRequest>(params.path);
      if (!txRequest) {
        throw new Error('Error JSON txrequest-inline parsing');
      }

      resolveTxType(txRequest);
    } catch (err) {
      debugLog('[txrequest-url]', err);
      Toast.fail(err?.message);
    }
  });

  deeplinking.add('/ton-login/*', async ({ params, resolveParams }) => {
    try {
      Toast.loading();

      const { data } = await axios.get(`https://${params.path}`);

      const splittedHost = params.path.split('/');
      const hostname = splittedHost[0] ?? '';

      const tonconnect = new TonLoginClient(data);
      const request = tonconnect.getRequestBody();

      Toast.hide();
      openTonConnect({
        protocolVersion: 1,
        tonconnect,
        hostname,
        request,
        ...resolveParams,
      });
    } catch (err) {
      Toast.hide();
      let message = err?.message;
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as Record<string, any> | undefined;
        message = data?.error ?? t('error_network');
      }

      debugLog('[TonLogin]:', err);
      Toast.fail(message);
    }
  });

  deeplinking.add('/ton-connect/*', async ({ query, origin }) => {
    try {
      TonConnectRemoteBridge.setOrigin(origin);
      TonConnectRemoteBridge.setReturnStrategy(query.ret);

      if (!query.r || !query.v || !query.id) {
        return;
      }

      Toast.loading();

      await TonConnectRemoteBridge.handleConnectDeeplink(
        query as unknown as IConnectQrQuery,
      );
    } catch (err) {
      console.log(err);
    }
  });
}
