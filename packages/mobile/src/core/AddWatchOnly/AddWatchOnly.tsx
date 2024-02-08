import { SendRecipient } from '$core/Send/Send.interface';
import { AddressInput } from '$core/Send/steps/AddressStep/components';
import { Tonapi } from '$libs/Tonapi';
import {
  AppStackRouteNames,
  TabsStackRouteNames,
  openSetupWalletDone,
} from '$navigation';
import { goBack, navigate } from '$navigation/imperative';
import { asyncDebounce, isTransferOp, parseTonLink } from '$utils';
import { tk } from '$wallet';
import { WalletColor } from '$wallet/WalletTypes';
import { Address } from '@tonkeeper/core';
import { t } from '@tonkeeper/shared/i18n';
import { Button, Screen, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import React, { FC, useCallback, useMemo, useState } from 'react';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

let dnsAbortController: null | AbortController = null;

export const AddWatchOnly: FC = () => {
  const [account, setAccount] = useState<Omit<SendRecipient, 'blockchain'> | null>(null);
  const [dnsLoading, setDnsLoading] = useState(false);

  const getAddressByDomain = useMemo(
    () =>
      asyncDebounce(async (value: string, signal: AbortSignal) => {
        try {
          const domain = value.toLowerCase();
          const resolvedDomain = await Tonapi.resolveDns(domain, signal);

          if (resolvedDomain === 'aborted') {
            return 'aborted';
          } else if (resolvedDomain?.wallet?.address) {
            return resolvedDomain.wallet.address as string;
          }

          return null;
        } catch (e) {
          console.log('err', e);

          return null;
        }
      }, 1000),
    [],
  );

  const validate = useCallback(
    async (value: string) => {
      if (value.length === 0) {
        setAccount(null);

        return false;
      }

      try {
        const link = parseTonLink(value);

        if (dnsAbortController) {
          dnsAbortController.abort();
          dnsAbortController = null;
          setDnsLoading(false);
        }

        if (link.match && isTransferOp(link.operation) && Address.isValid(link.address)) {
          if (link.query.bin) {
            return false;
          }

          value = link.address;
        }

        if (Address.isValid(value)) {
          setAccount({ address: value });

          return true;
        }

        const domain = value.toLowerCase();

        if (!Address.isValid(domain)) {
          setDnsLoading(true);
          const abortController = new AbortController();
          dnsAbortController = abortController;

          const zone = domain.indexOf('.') === -1 ? '.ton' : '';
          const resolvedDomain = await getAddressByDomain(
            domain + zone,
            abortController.signal,
          );

          if (resolvedDomain === 'aborted') {
            setDnsLoading(false);
            dnsAbortController = null;
            return true;
          } else if (resolvedDomain) {
            setAccount({ address: resolvedDomain, domain });
            setDnsLoading(false);
            dnsAbortController = null;
            return true;
          } else {
            setDnsLoading(false);
            dnsAbortController = null;
          }
        }

        setAccount(null);

        return false;
      } catch (e) {
        return false;
      }
    },
    [getAddressByDomain, setAccount],
  );

  const handleContinue = useCallback(async () => {
    if (!account) {
      return;
    }

    await tk.addWatchOnlyWallet(account.address);

    openSetupWalletDone();
  }, [account]);

  const keyboard = useAnimatedKeyboard();

  const keyboardStyle = useAnimatedStyle(() => ({
    height: keyboard.height.value,
  }));

  return (
    <Screen>
      <Screen.Header />
      <Screen.Content>
        <View style={styles.container}>
          <Spacer y={24} />
          <Text type="h2" textAlign="center">
            {t('add_watch_only.title')}
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            {t('add_watch_only.subtitle')}
          </Text>
          <Spacer y={32} />
          <AddressInput
            recipient={account as SendRecipient}
            updateRecipient={validate}
            shouldFocus={true}
            dnsLoading={dnsLoading}
            editable
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title={t('continue')} onPress={handleContinue} disabled={!account} />
        </View>
        <Animated.View style={keyboardStyle} />
      </Screen.Content>
    </Screen>
  );
};

const styles = Steezy.create(({ safeArea }) => ({
  container: {
    paddingHorizontal: 32,
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: safeArea.bottom,
    paddingHorizontal: 32,
  },
}));
