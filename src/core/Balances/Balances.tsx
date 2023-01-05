import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, RefreshControl, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNetInfo } from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';

import * as S from './Balances.style';
import { Button, Icon, InternalNotification, Loader, ScrollHandler, Text } from '$uikit';
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
  SecondaryCryptoCurrencies,
  TabletMaxWidth,
} from '$shared/constants';
import { openRequireWalletModal, openScanQR, openSend } from '$navigation';
import { eventsActions, eventsSelector } from '$store/events';
import { mainActions, mainSelector } from '$store/main';
import { InternalNotificationProps } from '$uikit/InternalNotification/InternalNotification.interface';
import { LargeNavBarInteractiveDistance } from '$uikit/LargeNavBar/LargeNavBar';
import { getLastRefreshedAt, MainDB } from '$database';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { store } from '$store';
import { jettonsSelector } from '$store/jettons';
import { DeeplinkOrigin, useDeeplinking } from '$libs/deeplinking';
import { TransactionsList } from '$core/Balances/TransactionsList/TransactionsList';
import { toastActions } from '$store/toast';
import Clipboard from '@react-native-community/clipboard';

export const Balances: FC = () => {
  const deeplinking = useDeeplinking();
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
  const {
    badHosts,
    isBadHostsDismissed,
    internalNotifications,
    timeSyncedDismissedTimestamp,
    isTimeSynced,
  } = useSelector(mainSelector);

  const netInfo = useNetInfo();
  const prevNetInfo = usePrevious(netInfo);

  const jettonBalances = useJettonBalances();
  const { showJettons } = useSelector(jettonsSelector);
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

  const handleCreateWallet = useCallback(() => {
    openRequireWalletModal();
  }, []);

  const handleCopyAddress = useCallback(() => {
    if (address.ton) {
      Clipboard.setString(address.ton);
      dispatch(toastActions.success(t('address_copied')));
      triggerImpactLight();
    }
  }, [address]);

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
    }[] = [
      {
        data: [CryptoCurrencies.Ton],
        footer: <S.ListSectionsSpacer />,
      },
    ];

    if (otherCurrencies.length > 0) {
      result.push({
        data: otherCurrencies,
        footer: <S.ListSectionsSpacer />,
      });
    }

    if (showJettons && jettonBalances.length > 0) {
      result.push({
        data: jettonBalances.map((jetton) => ({
          type: 'jetton',
          data: jetton,
        })),
      });
    }
    for (let index = 0; index < oldWalletBalances.length; index++) {
      if (
        wallet?.ton.version &&
        wallet?.ton.version <= oldWalletBalances[index].version
      ) {
        continue;
      }
      result.push({
        data: [
          {
            type: 'old_wallet_balance',
            data: oldWalletBalances[index],
            index,
          },
        ],
      });
    }

    //
    // result.push({
    //   data: ['add_coin_button'],
    // });
    return result;
  }, [otherCurrencies, oldWalletBalances, jettonBalances, showJettons, wallet?.ton]);

  const handleLoadMore = useCallback(() => {
    if (isEventsLoading || !canLoadMore) {
      return;
    }

    dispatch(eventsActions.loadEvents({ isLoadMore: true }));
  }, [dispatch, isEventsLoading, canLoadMore]);

  const notifications = useMemo(() => {
    const result: InternalNotificationProps[] = [];

    if (isConfigError) {
      result.push({
        title: t('notify_no_signal_title'),
        caption: t('notify_no_signal_caption'),
        mode: 'warning',
      });
    } else if (netInfo.isConnected === false) {
      if (!isNoSignalDismissed) {
        result.push({
          title: t('notify_no_signal_title'),
          caption: t('notify_no_signal_caption'),
          mode: 'danger',
          onClose: () => setNoSignalDismissed(true),
        });
      }
    } else if (badHosts.length > 0 && !isBadHostsDismissed) {
      result.push({
        title: t('notify_connection_err_title'),
        caption: t(
          badHosts.length > 1
            ? 'notify_connection_err_caption_few'
            : 'notify_connection_err_caption',
          {
            host: badHosts[0],
            hosts: badHosts.slice(0, badHosts.length - 1).join(', '),
            lastHost: badHosts[badHosts.length - 1],
          },
        ),
        mode: 'danger',
        onClose: () => dispatch(mainActions.dismissBadHosts()),
      });
    } else if (
      !isTimeSynced &&
      (!timeSyncedDismissedTimestamp ||
        timeSyncedDismissedTimestamp < Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) {
      result.push({
        title: t('notify_incorrect_time_err_title'),
        caption: t('notify_incorrect_time_err_caption'),
        mode: 'tertiary',
        onClose: () => {
          MainDB.setTimeSyncedDismissed(Date.now());
          dispatch(mainActions.setTimeSyncedDismissed(Date.now()));
        },
      });
    }

    if (internalNotifications.length > 0) {
      for (const item of internalNotifications) {
        const prepared: InternalNotificationProps = {
          title: item.title,
          caption: item.caption,
          mode: item.mode,
          onClose: () => {
            dispatch(mainActions.hideNotification(item));
          },
        };

        if (item.action) {
          prepared.action = item.action.label;
          prepared.onPress = () => {
            if (item.action.type === 'open_link') {
              Linking.openURL(item.action.url!).catch((err) => {
                console.log('cant open url', err);
              });
            }
          };
        }

        result.push(prepared);
      }
    }

    return result;
  }, [
    badHosts,
    isBadHostsDismissed,
    timeSyncedDismissedTimestamp,
    isTimeSynced,
    t,
    dispatch,
    netInfo,
    isNoSignalDismissed,
    internalNotifications,
    isConfigError,
  ]);

  function renderHeader() {
    // return (
    //   <Button onPress={() => {
    //   }}>
    //     Resolve deeplinks
    //   </Button>
    // );
    if (!notifications.length) {
      return null;
    }

    return (
      <View>
        {notifications.map((notification, i) => (
          <InternalNotification
            key={i}
            mode={notification.mode}
            title={notification.title}
            caption={notification.caption}
            action={notification.action}
            onPress={notification.onPress}
            onClose={notification.onClose}
          />
        ))}
      </View>
    );
  }

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
          />
        }
        eventsInfo={eventsInfo}
        initialData={initialData}
        renderHeader={renderHeader}
        renderFooter={renderFooter}
        otherCurrencies={otherCurrencies}
        onEndReached={isEventsLoading || !canLoadMore ? undefined : handleLoadMore}
        contentContainerStyle={{
          maxWidth: ns(TabletMaxWidth),
          alignSelf: 'center',
          paddingTop: ns(LargeNavBarHeight),
          paddingHorizontal: ns(16),
          paddingBottom: tabBarHeight - ns(20),
        }}
      />
    );
  }

  const handlePressOpenScanQR = React.useCallback(() => {
    if (store.getState().wallet.wallet) {
      openScanQR((str) => {
        if (isValidAddress(str)) {
          setTimeout(() => {
            openSend(CryptoCurrencies.Ton, str);
          }, 200);

          return true;
        }

        const resolver = deeplinking.getResolver(str, {
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
  }, []);

  useEffect(() => {
    if (netInfo.isConnected && prevNetInfo.isConnected === false) {
      dispatch(mainActions.dismissBadHosts());
      handleRefresh();
    }
  }, [netInfo.isConnected, prevNetInfo.isConnected, handleRefresh, dispatch]);

  return (
    <S.Wrap>
      <ScrollHandler
        navBarTitle={t('wallet_title')}
        onPress={handleCopyAddress}
        hitSlop={{
          top: 22,
          bottom: 16,
          left: 16,
          right: 22,
        }}
        bottomComponent={
          address.ton ? (
            <Text variant="body2" color="foregroundSecondary">
              {maskifyTonAddress(address.ton)}
            </Text>
          ) : null
        }
        navBarRight={
          <TouchableOpacity
            onPress={handlePressOpenScanQR}
            style={{ zIndex: 3 }}
            activeOpacity={0.6}
            hitSlop={{
              top: 26,
              bottom: 26,
              left: 26,
              right: 26,
            }}
          >
            <Icon name="ic-viewfinder-28" color="accentPrimary" />
          </TouchableOpacity>
        }
      >
        {renderContent()}
      </ScrollHandler>
      {isLoaded && !wallet && (
        <S.CreateWalletButtonWrap style={{ bottom: tabBarHeight }}>
          <S.CreateWalletButtonContainer>
            <Button onPress={handleCreateWallet}>{t('balances_setup_wallet')}</Button>
          </S.CreateWalletButtonContainer>
        </S.CreateWalletButtonWrap>
      )}
    </S.Wrap>
  );
};
