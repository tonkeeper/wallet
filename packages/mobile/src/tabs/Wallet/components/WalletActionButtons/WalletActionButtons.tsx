import React, { memo, useCallback } from 'react';
import { View } from '$uikit';
import { Icon, IconNames, Steezy, Text, TouchableOpacity } from '@tonkeeper/uikit';
import { Dimensions } from 'react-native';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { trackEvent } from '$utils/stats';
import { Events, SendAnalyticsFrom } from '$store/models';
import { useWallet } from '@tonkeeper/shared/hooks';
import { useNavigation } from '@tonkeeper/router';
import { Separators, SeparatorsOneRow } from './Separators';
import { store } from '$store';
import { MainStackRouteNames, openScanQR, openSend } from '$navigation';
import { Address } from '@tonkeeper/core';
import { CryptoCurrencies } from '$shared/constants';
import { DeeplinkOrigin, useDeeplinking } from '$libs/deeplinking';
import { useFlags } from '$utils/flags';

const width = (Dimensions.get('window').width - 32) / 3;

export interface ActionButtonProps {
  title: string;
  icon: IconNames;
  onPress?: () => void;
  disabled?: boolean;
}

const ActionButton = ({ title, icon, onPress, disabled }: ActionButtonProps) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.actionButton.static,
        disabled && styles.actionButtonDisabled.static,
        { width },
      ]}
    >
      <Icon name={icon} />
      <Text color="textSecondary" type={'label3'}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export const WalletActionButtons = memo(() => {
  const wallet = useWallet();
  const nav = useNavigation();
  const deeplinking = useDeeplinking();
  const flags = useFlags(['disable_swap']);

  const isWatchOnly = wallet.isWatchOnly;

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
      openScanQR((address) => {
        if (Address.isValid(address)) {
          setTimeout(() => {
            openSend({ currency: CryptoCurrencies.Ton, address });
          }, 200);

          return true;
        }

        const resolver = deeplinking.getResolver(address, {
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
    <View style={styles.container}>
      <Separators oneRow={wallet.isTestnet} />
      <ActionButton
        disabled={isWatchOnly}
        onPress={handlePressSend}
        icon={'ic-arrow-up-outline-28'}
        title={'Send'}
      />
      <ActionButton
        onPress={handlePressReceive}
        icon={'ic-arrow-down-outline-28'}
        title={'Receive'}
      />
      <ActionButton
        disabled={isWatchOnly}
        icon={'ic-qr-viewfinder-outline-28'}
        title={'Scan'}
        onPress={handlePressScanQR}
      />
      {!wallet.isTestnet && (
        <>
          {!flags.disable_swap && (
            <ActionButton
              disabled={isWatchOnly}
              onPress={handlePressSwap}
              icon={'ic-swap-horizontal-outline-28'}
              title={'Swap'}
            />
          )}
          <ActionButton
            onPress={handlePressBuy}
            icon={'ic-usd-28'}
            title={'Buy or Sell'}
          />
          <ActionButton
            onPress={handlePressStaking}
            disabled={isWatchOnly}
            icon={'ic-staking-outline-28'}
            title={'Stake'}
          />
        </>
      )}
    </View>
  );
});

const styles = Steezy.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 19.5,
  },
  actionButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
});
