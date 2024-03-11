import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as S from './Wallet.style';
import { useWalletInfo } from '$hooks/useWalletInfo';
import { Button, PopupMenu, PopupMenuItem } from '$uikit';
import { MainStackRouteNames, openDAppBrowser, openSend } from '$navigation';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { walletActions } from '$store/wallet';
import { Linking, View } from 'react-native';
import { delay, ns } from '$utils';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { i18n, t } from '@tonkeeper/shared/i18n';
import { useNavigation } from '@tonkeeper/router';
import { Chart } from '$shared/components/Chart/new/Chart';
import { formatter } from '$utils/formatter';
import { Toast } from '$store';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { Icon, Screen, TonIcon, IconButton, IconButtonList } from '@tonkeeper/uikit';

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

  const handleOpenAction = useCallback(async (action: any) => {
    try {
      let shouldOpenInBrowser = action.openInBrowser;
      if (action.scheme) {
        shouldOpenInBrowser = await Linking.canOpenURL(action.scheme);
      }
      if (shouldOpenInBrowser) {
        return Linking.openURL(action.url);
      }
      openDAppBrowser(action.url);
    } catch (e) {
      console.log(e);
      openDAppBrowser(action.url);
    }
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

  const handleOpenExchange = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }
    nav.openModal('Exchange');
  }, [nav, wallet]);

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
        <S.Divider style={{ marginBottom: ns(16) }} />
        <S.ActionsContainer>
          <IconButtonList horizontalIndent={i18n.locale === 'ru' ? 'large' : 'small'}>
            {!isWatchOnly ? (
              <IconButton
                onPress={handleSend}
                iconName="ic-arrow-up-28"
                title={t('wallet.send_btn')}
              />
            ) : null}
            <IconButton
              onPress={handleReceive}
              iconName="ic-arrow-down-28"
              title={t('wallet.receive_btn')}
            />
            {!isWatchOnly ? (
              <IconButton
                onPress={handleOpenExchange}
                iconName="ic-usd-28"
                title={t('wallet.buy_btn')}
              />
            ) : null}
            {!flags.disable_swap && !isWatchOnly && (
              <IconButton
                onPress={handlePressSwap}
                iconName="ic-swap-horizontal-28"
                title={t('wallet.swap_btn')}
              />
            )}
          </IconButtonList>
        </S.ActionsContainer>
        <S.Divider />
      </S.TokenInfoWrap>
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
