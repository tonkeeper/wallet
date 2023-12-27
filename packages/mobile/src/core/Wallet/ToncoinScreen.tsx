import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as S from './Wallet.style';
import { useWalletInfo } from '$hooks/useWalletInfo';
import { Button, PopupMenu, PopupMenuItem, IconButton, SwapIcon } from '$uikit';
import { MainStackRouteNames, openDAppBrowser, openSend } from '$navigation';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { walletActions, walletWalletSelector } from '$store/wallet';
import { Linking, View } from 'react-native';
import { delay, ns } from '$utils';
import {
  CryptoCurrencies,
  CryptoCurrency,
  Decimals,
  getServerConfig,
} from '$shared/constants';
import { t } from '@tonkeeper/shared/i18n';
import { useNavigation } from '@tonkeeper/router';
import { Chart } from '$shared/components/Chart/new/Chart';
import { formatter } from '$utils/formatter';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { Icon, Screen, TonIcon } from '@tonkeeper/uikit';

import { ActivityList } from '@tonkeeper/shared/components';
import { useTonActivityList } from '@tonkeeper/shared/query/hooks/useTonActivityList';
import _ from 'lodash';
import { navigate } from '$navigation/imperative';
import { useNewWallet } from '@tonkeeper/shared/hooks/useWallet';
import { fiatCurrencySelector } from '$store/main';
import { FiatCurrencies } from '@tonkeeper/core';

export const ToncoinScreen = memo(() => {
  const activityList = useTonActivityList();
  const tonRawAddress = useNewWallet((state) => state.ton.address.raw);

  const handleOpenExplorer = useCallback(async () => {
    openDAppBrowser(getServerConfig('accountExplorer').replace('%s', tonRawAddress));
  }, [tonRawAddress]);

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
  const tonFriendlyAddress = useNewWallet((state) => state.ton.address.friendly);
  const flags = useFlags(['disable_swap']);
  const fiatCurrency = useSelector(fiatCurrencySelector);
  const shouldShowChart = fiatCurrency !== FiatCurrencies.Ton;

  const dispatch = useDispatch();
  const [lockupDeploy, setLockupDeploy] = useState('loading');
  const nav = useNavigation();

  useEffect(() => {
    // TODO: Lockup
    // if (wallet && wallet.ton.isLockup()) {
    //   wallet.ton
    //     .getWalletInfo(tonFriendlyAddress)
    //     .then((info: any) => {
    //       setLockupDeploy(
    //         ['empty', 'uninit', 'nonexist'].includes(info.status) ? 'deploy' : 'deployed',
    //       );
    //     })
    //     .catch((err: any) => {
    //       Toast.fail(err.message);
    //     });
    // }
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

  const { amount, tokenPrice } = useWalletInfo(CryptoCurrencies.Ton);

  const handleReceive = useCallback(() => {
    nav.go('ReceiveModal');
  }, []);

  const handleSend = useCallback(() => {
    openSend({ currency: 'ton' });
  }, []);

  const handleOpenExchange = useCallback(() => {
    nav.openModal('Exchange');
  }, [nav]);

  const handlePressSwap = useCallback(() => {
    nav.openModal('Swap');
  }, [nav]);

  const handleDeploy = useCallback(() => {
    setLockupDeploy('loading');
    dispatch(
      walletActions.deployWallet({
        onDone: () => setLockupDeploy('deployed'),
        onFail: () => setLockupDeploy('deploy'),
      }),
    );
  }, [dispatch]);

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
          <IconButton
            onPress={handleSend}
            iconName="ic-arrow-up-28"
            title={t('wallet.send_btn')}
          />
          <IconButton
            onPress={handleReceive}
            iconName="ic-arrow-down-28"
            title={t('wallet.receive_btn')}
          />
          <IconButton
            onPress={handleOpenExchange}
            iconName="ic-plus-28"
            title={t('wallet.buy_btn')}
          />
          {!flags.disable_swap && (
            <IconButton
              onPress={handlePressSwap}
              icon={<SwapIcon />}
              title={t('wallet.swap_btn')}
            />
          )}
        </S.ActionsContainer>
        <S.Divider />
      </S.TokenInfoWrap>
      {shouldShowChart && (
        <>
          <S.ChartWrap>
            <Chart />
          </S.ChartWrap>
          <S.Divider style={{ marginBottom: 0 }} />
        </>
      )}
      {/* {wallet && wallet.ton.isLockup() && (
        <View style={{ padding: ns(16) }}>
          <Button
            onPress={handleDeploy}
            disabled={lockupDeploy === 'deployed'}
            isLoading={lockupDeploy === 'loading'}
          >
            {lockupDeploy === 'deploy' ? 'Deploy Wallet' : 'Deployed'}
          </Button>
        </View>
      )}  */}
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
