import axios from 'axios';
import { Ton } from '$libs/Ton';
import { useDispatch } from 'react-redux';
import { DeeplinkingResolver, useDeeplinking } from '$libs/deeplinking';
import { CryptoCurrencies } from '$shared/constants';
import { walletActions } from '$store/wallet';
import {
  Base64,
  compareAddresses,
  delay,
  fromNano,
  isValidAddress,
} from '$utils';
import { debugLog } from '$utils/debugLog';
import { store, Toast } from '$store';
import { TxRequest } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import {

  openCreateSubscription,
  openDeploy,
  openSend,
} from '../helper';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';

import { t } from '$translation';
import { getTimeSec } from '$utils/getTimeSec';
import { TonLoginClient } from '@tonapps/tonlogin-client';
import { useNavigation } from '@tonkeeper/router';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { isSignRawParams } from '$utils/isSignRawParams';
import { SignRawMessage } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { AppStackRouteNames } from '$navigation/navigationNames';
import { ModalName } from '$core/ModalContainer/ModalContainer.interface';
import { TonConnectRemoteBridge } from '$tonconnect/TonConnectRemoteBridge';
import { openTimeNotSyncedModal } from '$core/ModalContainer/TimeNotSynced/TimeNotSynced';
import { openAddressMismatchModal } from '$core/ModalContainer/AddressMismatch/AddressMismatch';
import { openTonConnect } from '$core/TonConnect/TonConnectModal';
import { useCallback, useRef } from 'react';
import { openInsufficientFundsModal } from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import BigNumber from 'bignumber.js';
import { Tonapi } from '$libs/Tonapi';
import { checkFundsAndOpenNFTTransfer } from '$core/ModalContainer/NFTOperations/Modals/NFTTransferModal';
import { openNFTTransferInputAddressModal } from '$core/ModalContainer/NFTTransferInputAddressModal/NFTTransferInputAddressModal';
import { getCurrentRoute } from '$navigation/imperative';
import { IConnectQrQuery } from '$tonconnect/models';

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
    'tc://',
    'ton://',
    'tonkeeper://',
    'https://app.tonkeeper.com',
    'https://tonhub.com',
  ]);

  deeplinking.addMiddleware(async (next) => {
    if (!getWallet()) {
      return openRequireWalletModal();
    }

    const currentRouteName = getCurrentRoute()?.name;

    if (
      ['SheetsProvider', AppStackRouteNames.ModalContainer].includes(currentRouteName)
    ) {
      TonConnectRemoteBridge.setReturnStrategy('none');
      nav.goBack();

      await delay(1000);
    }

    next();
  });

  const tonConnectResolver: DeeplinkingResolver = useCallback(
    async ({ query, origin }) => {
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
    },
    [],
  );

  deeplinking.add('/', (options) => {
    if (options.prefix !== 'tc://') {
      return;
    }

    return tonConnectResolver(options);
  });

  deeplinking.add('/subscribe/:invoiceId', ({ params }) => {
    const wallet = getWallet();
    if (!wallet.ton.isV4()) {
      dispatch(walletActions.openMigration());
    } else {
      openCreateSubscription(params.invoiceId);
    }
  });

  deeplinking.add('/buy-ton', () => {
    if (!getWallet()) {
      return openRequireWalletModal();
    } else {
      nav.openModal('Exchange');
    }
  });

  deeplinking.add('/swap', ({ query }) => {
    if (!getWallet()) {
      return openRequireWalletModal();
    } else {
      nav.openModal('Swap', { ft: query.ft, tt: query.tt });
    }
  });

  deeplinking.add('/transfer/:address', async ({ params, query, resolveParams }) => {
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

        const currentAddress = await getWallet().ton.getAddress();
        const { balances } = await Tonapi.getJettonBalances(currentAddress);
        const jettonBalance = balances.find((balance) =>
          compareAddresses(balance.jetton?.address, query.jetton),
        );

        if (!jettonBalance) {
          return Toast.fail(t('transfer_deeplink_address_error'));
        }

        let decimals = jettonBalance.jetton?.decimals ?? 9;
        const amount = fromNano(query.amount.toString(), decimals);

        if (new BigNumber(jettonBalance.balance ?? 0).lt(query.amount)) {
          openInsufficientFundsModal({
            balance: jettonBalance.balance ?? 0,
            totalAmount: query.amount,
            decimals,
            currency: jettonBalance.jetton?.symbol,
          });
          return;
        }

        dispatch(
          walletActions.confirmSendCoins({
            decimals,
            currency,
            amount,
            address,
            comment,
            jettonWalletAddress: query.jetton,
            isJetton: true,
            onInsufficientFunds: openInsufficientFundsModal,
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
        const amount = Ton.fromNano(query.amount.toString());
        dispatch(
          walletActions.confirmSendCoins({
            currency,
            amount,
            address,
            comment,
            onInsufficientFunds: openInsufficientFundsModal,
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
      openSend({
        currency: query.jetton,
        address,
        comment,
        withGoBack: resolveParams.withGoBack,
        isJetton: true,
      });
    } else if (query.nft) {
      if (!isValidAddress(query.nft)) {
        return Toast.fail(t('transfer_deeplink_nft_address_error'));
      }
      await checkFundsAndOpenNFTTransfer(query.nft, address);
    } else {
      openSend({ currency, address, comment, isJetton: false });
    }
  });

  deeplinking.add('/transfer', async ({ query }) => {
    const nft = query.nft;
    if (nft) {
      if (!isValidAddress(nft)) {
        return Toast.fail(t('transfer_deeplink_nft_address_error'));
      }
      await openNFTTransferInputAddressModal({ nftAddress: nft });
    } else {
      openSend({ currency: CryptoCurrencies.Ton });
    }
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
        await openSignRawModal(params, options);
        break;
      case 'deploy':
        openDeploy(txBody);
        break;
    }
  };

  const prevTxRequestPath = useRef('');
  deeplinking.add('/v1/txrequest-url/*', async ({ params }) => {
    try {
      if (params.path === prevTxRequestPath.current) {
        return;
      }

      prevTxRequestPath.current = params.path;
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
    } finally {
      setTimeout(() => {
        prevTxRequestPath.current = '';
      }, 1000);
    }
  });

  deeplinking.add('/v1/txrequest-inline/*', async ({ params }) => {
    try {
      const txRequest = Base64.decodeToObj<TxRequest>(params.path);
      if (!txRequest) {
        throw new Error('Error JSON txrequest-inline parsing');
      }

      await resolveTxType(txRequest);
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

  deeplinking.add('/ton-connect/*', tonConnectResolver);
}
