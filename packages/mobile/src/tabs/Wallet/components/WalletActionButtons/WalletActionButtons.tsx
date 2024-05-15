import React, { memo, useCallback } from 'react';
import { ActionButtons } from '@tonkeeper/uikit';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { trackEvent } from '$utils/stats';
import { Events, SendAnalyticsFrom } from '$store/models';
import { useWallet } from '@tonkeeper/shared/hooks';
import { useNavigation } from '@tonkeeper/router';
import { store } from '$store';
import { MainStackRouteNames, openScanQR, openSend } from '$navigation';
import { Address } from '@tonkeeper/core';
import { CryptoCurrencies } from '$shared/constants';
import { DeeplinkOrigin, useDeeplinking } from '$libs/deeplinking';
import { useFlags } from '$utils/flags';
import { t } from '@tonkeeper/shared/i18n';

export const WalletActionButtons = memo(() => {
  const wallet = useWallet();
  const nav = useNavigation();
  const deeplinking = useDeeplinking();
  const flags = useFlags(['disable_swap']);

  const handlePressSwap = useCallback(() => {
    if (wallet) {
      nav.openModal('Swap');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handlePressBuy = useCallback(() => {
    if (wallet) {
      nav.openModal('Exchange');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handlePressSend = useCallback(() => {
    if (wallet) {
      trackEvent(Events.SendOpen, { from: SendAnalyticsFrom.WalletScreen });
      nav.go('Send', { from: SendAnalyticsFrom.WalletScreen });
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handlePressReceive = useCallback(() => {
    if (wallet) {
      nav.go('ReceiveModal');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handlePressStaking = useCallback(() => {
    trackEvent('staking_open');
    nav.go(MainStackRouteNames.Staking);
  }, [nav]);

  const handlePressScanQR = React.useCallback(() => {
    if (store.getState().wallet.wallet) {
      openScanQR((value) => {
        if (Address.isValid(value)) {
          setTimeout(() => {
            openSend({ currency: CryptoCurrencies.Ton, address: value });
          }, 200);

          return true;
        }

        if (value.startsWith('tonkeeper://signer/link')) {
          return;
        }

        const resolver = deeplinking.getResolver(value, {
          delay: 200,
          origin: DeeplinkOrigin.QR_CODE,
        });

        if (resolver) {
          resolver();
          return true;
        }

        return false;
      });
    } else {
      openRequireWalletModal();
    }
  }, [deeplinking]);

  return (
    <ActionButtons
      buttons={[
        {
          id: 'send',
          disabled: wallet.isWatchOnly,
          onPress: handlePressSend,
          icon: 'ic-arrow-up-outline-28',
          title: t('wallet.send_btn'),
        },
        {
          id: 'receive',
          onPress: handlePressReceive,
          icon: 'ic-arrow-down-outline-28',
          title: t('wallet.receive_btn'),
        },
        {
          id: 'scan',
          icon: 'ic-qr-viewfinder-outline-28',
          title: t('wallet.scan_btn'),
          onPress: handlePressScanQR,
          disabled: wallet.isWatchOnly,
        },
        {
          id: 'swap',
          disabled: wallet.isWatchOnly || wallet.isLedger,
          onPress: handlePressSwap,
          icon: 'ic-swap-horizontal-outline-28',
          title: t('wallet.swap_btn'),
          visible: !wallet.isTestnet && !flags.disable_swap,
        },
        {
          id: 'buy',
          onPress: handlePressBuy,
          icon: 'ic-usd-outline-28',
          title: t('wallet.buy_btn'),
          visible: !wallet.isTestnet,
        },
        {
          id: 'staking',
          onPress: handlePressStaking,
          disabled: wallet.isWatchOnly || wallet.isLedger,
          icon: 'ic-staking-outline-28',
          title: t('wallet.stake_btn'),
          visible: !wallet.isTestnet,
        },
      ]}
    />
  );
});
