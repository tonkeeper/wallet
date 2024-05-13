import axios from 'axios';
import { Ton } from '$libs/Ton';
import { useDispatch } from 'react-redux';
import { DeeplinkOrigin, DeeplinkingResolver, useDeeplinking } from '$libs/deeplinking';
import { CryptoCurrencies } from '$shared/constants';
import { walletActions } from '$store/wallet';
import { Base64, delay, fromNano, toNano } from '$utils';
import { debugLog } from '$utils/debugLog';
import { store, Toast } from '$store';
import {
  SignRawMessage,
  TxRequest,
} from '$core/ModalContainer/NFTOperations/TXRequest.types';
import {
  openBuyFiat,
  openSend,
  openSetupNotifications,
  openSetupWalletDone,
  resetToWalletTab,
} from '../helper';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';

import { t } from '@tonkeeper/shared/i18n';
import { getTimeSec } from '$utils/getTimeSec';
import { TonLoginClient } from '@tonapps/tonlogin-client';
import { useNavigation } from '@tonkeeper/router';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { isSignRawParams } from '$utils/isSignRawParams';
import { AppStackRouteNames, MainStackRouteNames } from '$navigation/navigationNames';
import { TonConnectRemoteBridge } from '$tonconnect/TonConnectRemoteBridge';
import { openAddressMismatchModal } from '$core/ModalContainer/AddressMismatch/AddressMismatch';
import { openTonConnect } from '$core/TonConnect/TonConnectModal';
import { useCallback, useRef } from 'react';
import { openInsufficientFundsModal } from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import BigNumber from 'bignumber.js';
import { getCurrentRoute } from '$navigation/imperative';
import { IConnectQrQuery } from '$tonconnect/models';
import { openCreateSubscription } from '$core/ModalContainer/CreateSubscription/CreateSubscription';
import { Address, AmountFormatter, ContractService, DNS } from '@tonkeeper/core';
import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { isMethodIdExists } from '$store/zustand/methodsToBuy/helpers';
import { openActivityActionModal } from '@tonkeeper/shared/modals/ActivityActionModal';
import { tk } from '$wallet';
import { config } from '$config';
import { TokenType } from '$core/Send/Send.interface';
import { ActionSource } from '$wallet/models/ActivityModel';
import { StakingTransactionType } from '$core/StakingSend/types';
import { ImportWalletInfo, WalletContractVersion } from '$wallet/WalletTypes';
import { ImportWalletStackRouteNames } from '$navigation/ImportWalletStack/types';

const getWallet = () => {
  return store.getState().wallet.wallet;
};

const getExpiresSec = () => {
  return getTimeSec() + 10 * 60;
};

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
    'https://ton.app',
  ]);

  deeplinking.addMiddleware(async (next, { prefix, pathname }) => {
    const isSignerPairing = pathname.startsWith('/signer/link');

    if (isSignerPairing) {
      next();

      return;
    }

    if (!getWallet() || !tk.wallet) {
      return openRequireWalletModal();
    }

    const isTonConnect =
      prefix === 'tc://' ||
      pathname.startsWith('/ton-connect') ||
      // legacy tonconnect
      pathname.startsWith('/ton-login');

    const isActionDeeplink = pathname.startsWith('/action');

    if (tk.wallet.isWatchOnly && !isTonConnect && !isActionDeeplink) {
      return;
    }

    if (isTonConnect && !tk.walletForUnlock) {
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
    if (!tk.wallet.isV4()) {
      Toast.fail(t('old_wallet_error'));
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

  deeplinking.add('/action/:actionId', ({ params, query }) => {
    const source = query.source as ActionSource | null;
    const actionId = params.actionId;
    return openActivityActionModal(actionId, source ?? ActionSource.Ton);
  });

  deeplinking.add('/exchange', async () => {
    if (!getWallet()) {
      return openRequireWalletModal();
    } else {
      nav.openModal('Exchange');
    }
  });

  deeplinking.add('/exchange/:id', async ({ params }) => {
    const methodId = params.id;
    if (!getWallet()) {
      return openRequireWalletModal();
    } else {
      Toast.loading();
      // refetch methods to buy TON
      await useMethodsToBuyStore.getState().actions.fetchMethodsToBuy();

      if (!isMethodIdExists(methodId)) {
        Toast.fail(t('exchange.not_exists'));
        return;
      }

      Toast.hide();
      openBuyFiat(CryptoCurrencies.Ton, methodId);
    }
  });

  deeplinking.add('/pool/:address', async ({ params }) => {
    const poolAddress = params.address;

    await tk.wallet.staking.load();

    const foundPool = tk.wallet.staking.state.data.pools?.find((pool) =>
      Address.compare(pool.address, poolAddress),
    );

    if (!foundPool) {
      Toast.fail(t('staking.not_exists'));
      return;
    }

    if (nav.closeModal) {
      nav.closeModal();
    }
    nav.navigate(MainStackRouteNames.StakingPoolDetails, {
      poolAddress: foundPool.address,
    });
  });

  deeplinking.add('/swap', ({ query }) => {
    if (!getWallet()) {
      return openRequireWalletModal();
    } else {
      nav.openModal('Swap', { ft: query.ft, tt: query.tt });
    }
  });

  deeplinking.add(
    '/inscription-transfer/:address',
    async ({ params, query, resolveParams }) => {
      Toast.loading();

      let address = params.address;
      if (DNS.isValid(address)) {
        const dnsRecord = await tk.wallet.tonapi.dns.dnsResolve(address);
        if (dnsRecord?.wallet?.address) {
          address = new Address(dnsRecord.wallet.address).toFriendly({
            bounceable: true,
          });
        } else {
          return Toast.fail(t('transfer_deeplink_address_error'));
        }
      }

      const ticker = query.ticker;
      const type = query.type;
      const amount = query.amount;
      const comment = query.text ?? '';

      if (!type || !ticker) {
        return Toast.fail(t('transfer_deeplink_wrong_params'));
      }

      if (amount && Number.isNaN(Number(amount))) {
        return Toast.fail(t('transfer_deeplink_amount_error'));
      }

      await tk.wallet.tonInscriptions.load();
      let inscriptions = tk.wallet?.tonInscriptions.state.getSnapshot();
      const inscription = inscriptions?.items.find(
        (item) => item.ticker === ticker && item.type === type,
      );
      if (!inscription) {
        return Toast.fail(t('transfer_deeplink_unknown_token'));
      }

      if (amount) {
        dispatch(
          walletActions.confirmSendCoins({
            currency: inscription.ticker,
            amount: fromNano(amount, inscription.decimals),
            address,
            comment,
            tokenType: TokenType.Inscription,
            currencyAdditionalParams: { type: inscription.type },
            onNext: (details) => {
              const options = {
                currency: inscription.ticker,
                address,
                comment,
                currencyAdditionalParams: { type: inscription.type },
                amount: fromNano(amount, inscription.decimals),
                tokenType: TokenType.Inscription,
                fee: details.fee,
                isInactive: details.isInactive,
                methodId: resolveParams.methodId,
                redirectToActivity: resolveParams.redirectToActivity,
              };
              openSend(options);
            },
          }),
        );
      } else {
        openSend({
          currency: inscription.ticker,
          currencyAdditionalParams: { type: inscription.type },
          address,
          comment,
          withGoBack: resolveParams.withGoBack,
          tokenType: TokenType.Inscription,
          redirectToActivity: resolveParams.redirectToActivity,
          amount: fromNano(amount, inscription.decimals),
        });
      }

      return Toast.hide();
    },
  );

  deeplinking.add('/transfer/:address', async ({ params, query, resolveParams }) => {
    const currency = CryptoCurrencies.Ton;
    const comment = query.text ?? '';

    const expiryTimestamp =
      query.exp && !Number.isNaN(parseInt(query.exp, 10))
        ? parseInt(query.exp, 10)
        : null;

    if (expiryTimestamp && expiryTimestamp < getTimeSec()) {
      return Toast.fail(t('transfer_deeplink_expired_error'));
    }

    let address = params.address;

    if (DNS.isValid(address)) {
      const dnsRecord = await tk.wallet.tonapi.dns.dnsResolve(address);
      if (dnsRecord?.wallet?.address) {
        address = new Address(dnsRecord.wallet.address).toFriendly({ bounceable: true });
      } else {
        return Toast.fail(t('transfer_deeplink_address_error'));
      }
    }

    if (!DNS.isValid(address) && !Address.isValid(address)) {
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
            valid_until: expiryTimestamp ?? getExpiresSec(),
            messages: [message],
          },
          {
            expires_sec: expiryTimestamp ?? getExpiresSec(),
            response_options: {
              broadcast: false,
            },
          },
          undefined,
          undefined,
          false,
          resolveParams.redirectToActivity,
        );
      } else if (query.jetton) {
        if (!Address.isValid(query.jetton)) {
          return Toast.fail(t('transfer_deeplink_address_error'));
        }

        await tk.wallet.jettons.load();
        const jettonBalance = tk.wallet.jettons.getLoadedJetton(query.jetton);

        if (!jettonBalance) {
          return Toast.fail(t('transfer_deeplink_unknown_jetton_error'));
        }

        let decimals = jettonBalance.metadata.decimals ?? 9;
        const amount = fromNano(query.amount.toString(), decimals);

        if (
          new BigNumber(
            toNano(jettonBalance.balance, jettonBalance.metadata.decimals ?? 9) ?? 0,
          ).lt(query.amount)
        ) {
          openInsufficientFundsModal({
            balance: jettonBalance.balance ?? 0,
            totalAmount: query.amount,
            decimals,
            currency: jettonBalance.metadata.symbol,
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
            jettonWalletAddress: jettonBalance.walletAddress,
            tokenType: TokenType.Jetton,
            onInsufficientFunds: openInsufficientFundsModal,
            onNext: (details) => {
              const options = {
                currency: query.jetton,
                isBattery: details.isBattery,
                address,
                comment,
                amount,
                fee: details.fee,
                isInactive: details.isInactive,
                tokenType: TokenType.Jetton,
                expiryTimestamp,
                redirectToActivity: resolveParams.redirectToActivity,
              };

              openSend(options);
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
                tokenType: TokenType.TON,
                fee: details.fee,
                isInactive: details.isInactive,
                methodId: resolveParams.methodId,
                expiryTimestamp,
                redirectToActivity: resolveParams.redirectToActivity,
              };
              if (options.methodId) {
                nav.openModal('NewConfirmSending', options);
              } else {
                openSend(options);
              }
            },
          }),
        );
      }
    } else if (query.jetton) {
      if (!Address.isValid(query.jetton)) {
        return Toast.fail(t('transfer_deeplink_address_error'));
      }
      openSend({
        currency: query.jetton,
        address,
        comment,
        withGoBack: resolveParams.withGoBack,
        tokenType: TokenType.Jetton,
        expiryTimestamp,
        redirectToActivity: resolveParams.redirectToActivity,
      });
    } else if (query.nft) {
      if (!Address.isValid(query.nft)) {
        return Toast.fail(t('transfer_deeplink_nft_address_error'));
      }
      const excessesAccount =
        !config.get('disable_battery_send') &&
        tk.wallet.battery.state.data.balance !== '0'
          ? tk.wallet.battery.excessesAccount
          : null;

      await openSignRawModal(
        {
          messages: [
            {
              amount: AmountFormatter.toNano(1),
              address: query.nft,
              payload: ContractService.createNftTransferBody({
                newOwnerAddress: address,
                excessesAddress: excessesAccount || tk.wallet.address.ton.raw,
              })
                .toBoc()
                .toString('base64'),
            },
          ],
        },
        {},
      );
    } else {
      openSend({
        currency,
        address,
        comment,
        tokenType: TokenType.TON,
        expiryTimestamp,
        redirectToActivity: resolveParams.redirectToActivity,
      });
    }
  });

  deeplinking.add('/transfer', async ({ query }) => {
    const nft = query.nft;
    if (nft) {
      if (!Address.isValid(nft)) {
        return Toast.fail(t('transfer_deeplink_nft_address_error'));
      }
      await nav.push(AppStackRouteNames.NFTSend, { nftAddress: nft });
    } else {
      openSend({ currency: CryptoCurrencies.Ton });
    }
  });

  const resolveTxType = async (
    txRequest: TxRequest,
    resolveParams: Record<string, any>,
  ) => {
    const wallet = getWallet();
    if (txRequest?.version !== '0') {
      throw new Error('Wrong txrequest protocol');
    }

    const txBody = txRequest.body as any;
    const isSignRaw = isSignRawParams(txBody?.params);

    if (
      txBody.expires_sec < getTimeSec() ||
      (isSignRaw && txBody.params.valid_until < getTimeSec())
    ) {
      throw new Error(t('nft_operations_expired'));
    }

    if (
      txBody.params.source &&
      Address.isValid(txBody.params.source) &&
      !Address.compare(txBody.params.source, await wallet.ton.getAddress())
    ) {
      Toast.hide();
      const foundWallet = tk.getWalletByAddress(txBody.params.source);
      if (!foundWallet) {
        return openAddressMismatchModal(
          () => resolveTxType(txRequest, resolveParams),
          txBody.params.source,
        );
      }

      resetToWalletTab();
      tk.switchWallet(foundWallet.identifier);
    }

    const props = { ...txBody, ...resolveParams };

    switch (txRequest.body.type) {
      case 'nft-collection-deploy':
        nav.openModal('NFTCollectionDeploy', props);
        break;
      case 'nft-item-deploy':
        nav.openModal('NFTItemDeploy', props);
        break;
      case 'nft-single-deploy':
        nav.openModal('NFTSingleDeploy', props);
        break;
      case 'nft-change-owner':
        nav.openModal('NFTChangeOwner', props);
        break;
      case 'nft-transfer':
        nav.openModal('NFTTransfer', props);
        break;
      case 'nft-sale-place':
        nav.openModal('NFTSalePlace', props);
        break;
      case 'nft-sale-place-getgems':
        nav.openModal('NFTSalePlaceGetgems', props);
        break;
      case 'nft-sale-cancel':
        nav.openModal('NFTSaleCancel', props);
        break;
      case 'sign-raw-payload':
        const { params, ...options } = txBody;
        await openSignRawModal(
          params,
          options,
          undefined,
          undefined,
          false,
          props.redirectToActivity,
        );
        break;
    }
  };

  const prevTxRequestPath = useRef('');
  deeplinking.add('/v1/txrequest-url/*', async ({ params, resolveParams }) => {
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

      await resolveTxType(data, resolveParams);
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

  deeplinking.add('/v1/txrequest-inline/*', async ({ params, resolveParams }) => {
    try {
      const txRequest = Base64.decodeToObj<TxRequest>(params.path);
      if (!txRequest) {
        throw new Error('Error JSON txrequest-inline parsing');
      }

      await resolveTxType(txRequest, resolveParams);
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

  deeplinking.add('/confirm-withdrawal/:address', ({ params }) => {
    let address = params.address;

    if (!Address.isValid(address)) {
      return Toast.fail('transfer_deeplink_address_error');
    }

    nav.push(AppStackRouteNames.StakingSend, {
      poolAddress: address,
      transactionType: StakingTransactionType.WITHDRAWAL_CONFIRM,
    });
  });

  deeplinking.add('/staking', () => {
    nav.push(MainStackRouteNames.Staking);
  });

  deeplinking.add('/publish', async ({ query }) => {
    if (!query.boc) {
      return;
    }

    tk.wallet.signer.setSignerResult(query.boc);
  });

  deeplinking.add('/signer/link', async ({ query, origin }) => {
    try {
      const network = query.network ?? 'ton';
      const publicKey = Buffer.from(query.pk, 'base64').toString('hex');
      const name = query.name;

      if (network !== 'ton') {
        Toast.fail('Unsupported network');
        return;
      }

      let walletsInfo: ImportWalletInfo[] | null = null;

      try {
        walletsInfo = await tk.getWalletsInfo(publicKey, false);
      } catch {}

      const shouldChooseWallets = walletsInfo && walletsInfo.length > 1;

      const addWallet = async (selectedVersions?: WalletContractVersion[]) => {
        try {
          const identifiers = await tk.addSignerWallet(
            publicKey,
            name,
            selectedVersions,
            origin === DeeplinkOrigin.DEEPLINK,
          );

          const isNotificationsDenied = await tk.wallet.notifications.getIsDenied();

          if (isNotificationsDenied) {
            openSetupWalletDone(identifiers);
          } else {
            openSetupNotifications(identifiers);
          }
        } catch (e) {
          console.log('error', e);
          Toast.fail(t('error_occurred'));
        }
      };

      if (shouldChooseWallets) {
        nav.navigate(MainStackRouteNames.ImportWalletStack, {
          screen: ImportWalletStackRouteNames.ChooseWallets,
          params: {
            walletsInfo,
            mnemonic: '',
            lockupConfig: null,
            isTestnet: false,
            onDone: addWallet,
          },
        });

        return;
      }

      await addWallet();
    } catch (e) {
      console.log('error', e);
      Toast.fail(t('error_occurred'));
    }
  });
}
