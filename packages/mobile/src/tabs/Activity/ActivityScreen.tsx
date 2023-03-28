import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, RefreshControl, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNetInfo } from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';

import * as S from '../../core/Balances/Balances.style';
import { Button, Icon, InternalNotification, Loader, NavBar, Screen, ScrollHandler, Text } from '$uikit';
import {
  useAppStateActive,
  usePrevious,
  useJettonBalances,
  useTheme,
  useTranslator,
} from '$hooks';
import { walletActions, walletSelector } from '$store/wallet';
import { isValidAddress, maskifyTonAddress, ns, triggerImpactLight } from '$utils';
import {
  CryptoCurrencies,
  isServerConfigLoaded,
  LargeNavBarHeight,
  NavBarHeight,
  SecondaryCryptoCurrencies,
  TabletMaxWidth,
} from '$shared/constants';
import { openRequireWalletModal, openScanQR, openSend } from '$navigation';
import { eventsActions, eventsSelector } from '$store/events';
import { mainActions, mainSelector } from '$store/main';
import { InternalNotificationProps } from '$uikit/InternalNotification/InternalNotification.interface';
import { LargeNavBarInteractiveDistance } from '$uikit/LargeNavBar/LargeNavBar';
import { getLastRefreshedAt, MainDB } from '$database';
import { jettonsSelector } from '$store/jettons';
import { TransactionsList } from '$core/Balances/TransactionsList/TransactionsList';
import { toastActions } from '$store/toast';
import Clipboard from '@react-native-community/clipboard';
import { useNavigation } from '$libs/navigation';

export const ActivityScreen: FC = () => {
  const nav = useNavigation();
  const t = useTranslator();
  const dispatch = useDispatch();
  const theme = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    currencies,
    isRefreshing,
    isLoaded,
    balances,
    address,
    wallet,
    oldWalletBalances,
  } = useSelector(walletSelector);
  const {
    isLoading: isEventsLoading,
    eventsInfo,
    canLoadMore,
  } = useSelector(eventsSelector);

  const netInfo = useNetInfo();
  const prevNetInfo = usePrevious(netInfo);

  const jettonBalances = useJettonBalances();
  const [isNoSignalDismissed, setNoSignalDismissed] = useState(false);
  const isConfigError = !isServerConfigLoaded();
  const isFocused = useIsFocused();

  const isEventsLoadingMore = !isRefreshing && isEventsLoading && !!wallet;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(mainActions.mainStackInited());
    }, 1000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  useAppStateActive(() => {
    dispatch(mainActions.getTimeSynced());
    getLastRefreshedAt().then((ts) => {
      if (Date.now() - ts > 60 * 1000) {
        dispatch(walletActions.refreshBalancesPage());
      }
    });
  });

  useEffect(() => {
    setNoSignalDismissed(false);
  }, [netInfo.isConnected]);

  const handleRefresh = useCallback(() => {
    dispatch(walletActions.refreshBalancesPage(true));
  }, [dispatch]);

  const otherCurrencies = useMemo(() => {
    const list = [...SecondaryCryptoCurrencies];
    if (wallet && wallet.ton.isLockup()) {
      list.unshift(CryptoCurrencies.TonRestricted, CryptoCurrencies.TonLocked);
    }

    return list.filter((item) => {
      if (item === CryptoCurrencies.Ton) {
        return false;
      }

      if (
        [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].indexOf(item) > -1
      ) {
        return true;
      }

      if (+balances[item] > 0) {
        return true;
      }

      return currencies.indexOf(item) > -1;
    });
  }, [currencies, balances, wallet]);

  const initialData = useMemo(() => {
    const result: {
      isFirst?: boolean;
      title?: string;
      data: any;
      footer?: React.ReactElement;
    }[] = [];
    return result;
  }, [otherCurrencies, oldWalletBalances, jettonBalances, wallet?.ton]);

  const handleLoadMore = useCallback(() => {
    if (isEventsLoading || !canLoadMore) {
      return;
    }

    dispatch(eventsActions.loadEvents({ isLoadMore: true }));
  }, [dispatch, isEventsLoading, canLoadMore]);


  function renderFooter() {
    return (
      <>
        {isEventsLoadingMore ? (
          <S.LoaderMoreWrap>
            <Loader size="medium" />
          </S.LoaderMoreWrap>
        ) : null}
        {!wallet && <S.CreateWalletButtonHelper />}
        <View style={{ height: LargeNavBarInteractiveDistance }} />
        <S.BottomSpace />
      </>
    );
  }

  function renderContent() {
    if (!isLoaded) {
      return (
        <S.LoaderWrap style={{ paddingBottom: tabBarHeight }}>
          <Loader size="medium" />
        </S.LoaderWrap>
      );
    }

    return (
      <TransactionsList
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={isRefreshing && isFocused}
            tintColor={theme.colors.foregroundPrimary}
            progressBackgroundColor={theme.colors.foregroundPrimary}
          />
        }
        eventsInfo={eventsInfo}
        initialData={initialData}
        renderFooter={renderFooter}
        onEndReached={isEventsLoading || !canLoadMore ? undefined : handleLoadMore}
        contentContainerStyle={{
          width: '100%',
          maxWidth: ns(TabletMaxWidth),
          alignSelf: 'center',
          paddingTop: ns(NavBarHeight) + ns(4),
          paddingHorizontal: ns(16),
          paddingBottom: tabBarHeight - ns(20),
        }}
      />
    );
  }

  useEffect(() => {
    if (netInfo.isConnected && prevNetInfo.isConnected === false) {
      dispatch(mainActions.dismissBadHosts());
      handleRefresh();
    }
  }, [netInfo.isConnected, prevNetInfo.isConnected, handleRefresh, dispatch]);

  const handlePressRecevie = React.useCallback(() => {
    if (wallet) {
      nav.go('Receive', { 
        currency: 'ton',
        isFromMainScreen: true
      });
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);


  const handlePressBuy = React.useCallback(() => {
    if (wallet) {
      nav.openModal('Exchange', { category: 'buy' });
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);

  if (isLoaded && (!wallet || Object.keys(eventsInfo).length < 1)) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Text variant="h2" style={{ textAlign: 'center', marginBottom: ns(4) }}>
            {t('activity.empty_transaction_title')}
          </Text>
          <Text variant="body1" color="textSecondary">
            {t('activity.empty_transaction_caption')}
          </Text>

          <View style={styles.emptyButtons}>
            <Button 
              style={{ marginRight: ns(12) }}
              onPress={handlePressBuy}
              size="medium_rounded" 
              mode="secondary"
            >
              {t('activity.buy_toncoin_btn')}
            </Button>
            <Button 
              onPress={handlePressRecevie}
              size="medium_rounded" 
              mode="secondary"
            >
              {t('activity.receive_btn')}
            </Button>
          </View>
        </View>
      </Screen>
    )
  }

  return (
    <S.Wrap>
      <ScrollHandler navBarTitle={t('activity.screen_title')}>
        {renderContent()}
      </ScrollHandler>
    </S.Wrap>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  emptyButtons: {
    flexDirection: 'row',
    marginTop: ns(24)
  }
})