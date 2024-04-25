import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as S from './Wallet.style';
import { useWalletInfo } from '$hooks/useWalletInfo';
import { Button, PopupMenu, PopupMenuItem } from '$uikit';
import { MainStackRouteNames, openDAppBrowser, openSend } from '$navigation';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { walletActions } from '$store/wallet';
import { View } from 'react-native';
import { delay, ns } from '$utils';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { t } from '@tonkeeper/shared/i18n';
import { useNavigation } from '@tonkeeper/router';
import { Chart } from '$shared/components/Chart/new/Chart';
import { formatter } from '$utils/formatter';
import { Toast } from '$store';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { Icon, Screen, TonIcon, ActionButtons, Spacer } from '@tonkeeper/uikit';

import { ActivityList } from '@tonkeeper/shared/components';
import { useTonActivityList } from '@tonkeeper/shared/query/hooks/useTonActivityList';
import _ from 'lodash';
import { navigate } from '$navigation/imperative';
import { WalletCurrency } from '@tonkeeper/core';
import { useWallet, useWalletCurrency } from '@tonkeeper/shared/hooks';
import { config } from '$config';

export const ToncoinScreen = memo(() => {
  const activityList = useTonActivityList();
  const wallet = useWallet();

  const handleOpenExplorer = useCallback(async () => {
    openDAppBrowser(
      wallet
        ? config
            .get('accountExplorer', wallet.isTestnet)
            .replace('%s', wallet.address.ton.raw)
        : config.get('explorerUrl'),
    );
  }, [wallet]);

  // Temp hack for slow navigation
  const [render, setRender] = useState(false);
  useEffect(() => {
    delay(0).then(() => {
      setRender(true);
    });
  }, []);

  if (!render) {
    return null;
  }

  return (
    <Screen>
      <Screen.Header
        title="Toncoin"
        rightContent={
          <PopupMenu
            items={[
              <PopupMenuItem
                waitForAnimationEnd
                shouldCloseMenu
                onPress={handleOpenExplorer}
                text={t('jetton_open_explorer')}
                icon={<Icon name="ic-globe-16" color="accentBlue" />}
              />,
            ]}
          >
            <S.HeaderViewDetailsButton onPress={() => null}>
              <Icon name="ic-ellipsis-16" color="iconPrimary" />
            </S.HeaderViewDetailsButton>
          </PopupMenu>
        }
      />
      <ActivityList
        ListHeaderComponent={<HeaderList />}
        onLoadMore={activityList.loadMore}
        onReload={activityList.reload}
        isReloading={activityList.isReloading}
        isLoading={activityList.isLoading}
        sections={activityList.sections}
        hasMore={activityList.hasMore}
        error={activityList.error}
      />
    </Screen>
  );
});

const HeaderList = memo(() => {
  const wallet = useWallet();
  const flags = useFlags(['disable_swap']);
  const fiatCurrency = useWalletCurrency();
  const shouldShowChart = fiatCurrency !== WalletCurrency.TON;

  const dispatch = useDispatch();
  const [lockupDeploy, setLockupDeploy] = useState('loading');
  const nav = useNavigation();

  useEffect(() => {
    if (wallet && wallet.isLockup) {
      wallet
        .getWalletInfo()
        .then((info) => {
          setLockupDeploy(
            ['empty', 'uninit', 'nonexist'].includes(info.status) ? 'deploy' : 'deployed',
          );
        })
        .catch((err: any) => {
          Toast.fail(err.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { amount, tokenPrice } = useWalletInfo();

  const handleReceive = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    nav.go('ReceiveModal');
  }, [nav, wallet]);

  const handleSend = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }
    openSend({ currency: 'ton' });
  }, [wallet]);

  const handlePressSwap = useCallback(() => {
    if (wallet) {
      nav.openModal('Swap');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handleDeploy = useCallback(() => {
    setLockupDeploy('loading');
    dispatch(
      walletActions.deployWallet({
        onDone: () => setLockupDeploy('deployed'),
        onFail: () => setLockupDeploy('deploy'),
      }),
    );
  }, [dispatch]);

  const isWatchOnly = wallet && wallet.isWatchOnly;

  return (
    <>
      <S.TokenInfoWrap>
        <S.FlexRow>
          <S.AmountWrapper>
            <HideableAmount variant="h2">
              {formatter.format(amount, {
                currency: 'TON',
                currencySeparator: 'wide',
                decimals: Decimals[CryptoCurrencies.Ton]!,
              })}
            </HideableAmount>
            <HideableAmount
              style={{ marginTop: 2 }}
              variant="body2"
              color="foregroundSecondary"
            >
              {tokenPrice.formatted.totalFiat ?? '-'}
            </HideableAmount>
          </S.AmountWrapper>
          <TonIcon size="medium" showDiamond />
        </S.FlexRow>
      </S.TokenInfoWrap>
      <Spacer y={24} />
      <S.ActionsWrap>
        <ActionButtons
          buttons={[
            {
              id: 'send',
              disabled: isWatchOnly,
              onPress: handleSend,
              icon: 'ic-arrow-up-outline-28',
              title: t('wallet.send_btn'),
            },
            {
              id: 'receive',
              onPress: handleReceive,
              icon: 'ic-arrow-down-outline-28',
              title: t('wallet.receive_btn'),
            },
            {
              id: 'swap',
              disabled: isWatchOnly,
              onPress: handlePressSwap,
              icon: 'ic-swap-horizontal-outline-28',
              title: t('wallet.swap_btn'),
              visible: !wallet.isTestnet && !flags.disable_swap,
            },
          ]}
        />
      </S.ActionsWrap>
      <Spacer y={24} />
      {shouldShowChart && (
        <>
          <S.ChartWrap>
            <Chart currency={fiatCurrency} token={'ton'} />
          </S.ChartWrap>
          <S.Divider style={{ marginBottom: 0 }} />
        </>
      )}
      {wallet && wallet.isLockup && (
        <View style={{ padding: ns(16) }}>
          <Button
            onPress={handleDeploy}
            disabled={lockupDeploy === 'deployed'}
            isLoading={lockupDeploy === 'loading'}
          >
            {lockupDeploy === 'deploy' ? 'Deploy Wallet' : 'Deployed'}
          </Button>
        </View>
      )}
    </>
  );
});

export function openWallet(currency: CryptoCurrency) {
  _.throttle(() => {
    navigate(MainStackRouteNames.Wallet, {
      currency,
    });
  }, 1000)();
}
