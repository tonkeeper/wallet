import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { WalletProps } from './Wallet.interface';
import * as S from './Wallet.style';
import * as BalancesStyle from '../Balances/Balances.style';
import { useTheme } from '$hooks/useTheme';
import { useWalletInfo } from '$hooks/useWalletInfo';
import {
  Button,
  Icon,
  PopupMenu,
  PopupMenuItem,
  Text,
  ScrollHandler,
  IconButton,
  Loader,
  SwapIcon,
} from '$uikit';
import { MainStackRouteNames, openDAppBrowser, openReceive, openSend } from '$navigation';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import {
  walletActions,
  walletAddressSelector,
  walletIsRefreshingSelector,
  walletWalletSelector,
} from '$store/wallet';
import { Linking, Platform, RefreshControl, View } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionsList } from '$core/Balances/TransactionsList/TransactionsList';
import { eventsActions, eventsSelector } from '$store/events';
import { groupAndFilterTonActivityItems } from '$utils/transactions';
import { formatter } from '$utils/formatter';
import { Toast } from '$store';
import { useFlags } from '$utils/flags';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { TonIcon } from '../../components/TonIcon';
import { Events, SendAnalyticsFrom } from '$store/models';
import _ from 'lodash';
import { navigate } from '$navigation/imperative';
import { trackEvent } from '$utils/stats';

const exploreActions = [
  {
    icon: 'ic-globe-16',
    text: 'ton.org',
    url: 'https://ton.org',
  },
  {
    icon: 'ic-twitter-16',
    text: 'Twitter',
    url: 'https://twitter.com/ton_blockchain',
    scheme: 'twitter://search',
  },
  {
    icon: 'ic-telegram-16',
    text: t('wallet_chat'),
    url: t('wallet_toncommunity_chat_link'),
    scheme: 'tg://',
  },
  {
    icon: 'ic-telegram-16',
    text: t('wallet_community'),
    url: t('wallet_toncommunity_link'),
    scheme: 'tg://',
  },
  {
    icon: 'ic-doc-16',
    text: 'Whitepaper',
    openInBrowser: Platform.OS === 'android',
    url: 'https://ton.org/whitepaper.pdf',
  },
  {
    icon: 'ic-magnifying-glass-16',
    text: 'tonviewer.com',
    url: 'https://tonviewer.com',
  },
  {
    icon: 'ic-code-16',
    text: t('wallet_source_code'),
    url: 'https://github.com/ton-blockchain/ton',
    scheme: 'github://',
  },
];

export const Wallet: FC<WalletProps> = ({ route }) => {
  const currency = route.params.currency;
  const flags = useFlags(['disable_swap']);
  const wallet = useSelector(walletWalletSelector);
  const address = useSelector(walletAddressSelector);
  const isRefreshing = useSelector(walletIsRefreshingSelector);
  const dispatch = useDispatch();
  const [lockupDeploy, setLockupDeploy] = useState('loading');
  const nav = useNavigation();
  const { bottom: paddingBottom } = useSafeAreaInsets();
  const {
    isLoading: isEventsLoading,
    eventsInfo,
    canLoadMore,
  } = useSelector(eventsSelector);
  const theme = useTheme();

  const filteredEventsInfo = useMemo(() => {
    return groupAndFilterTonActivityItems(eventsInfo);
  }, [eventsInfo]);

  useEffect(() => {
    if (currency === CryptoCurrencies.Ton && wallet && wallet.ton.isLockup()) {
      wallet.ton
        .getWalletInfo(address[currency])
        .then((info: any) => {
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

  const currencyUpper = useMemo(() => {
    return currency?.toUpperCase();
  }, [currency]);
  const { amount, tokenPrice } = useWalletInfo(currency);

  const handleReceive = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    openReceive(currency);
  }, [currency, wallet]);

  const handleSend = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }
    trackEvent(Events.SendOpen, { from: SendAnalyticsFrom.TonScreen });

    openSend({ currency, from: SendAnalyticsFrom.TonScreen });
  }, [currency, wallet]);

  const handleOpenExchange = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }
    nav.openModal('Exchange');
  }, [nav, wallet]);

  const handlePressSwap = React.useCallback(() => {
    if (wallet) {
      nav.openModal('Swap');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handleRefresh = useCallback(() => {
    dispatch(walletActions.refreshBalancesPage(true));
  }, [dispatch]);

  const handleDeploy = useCallback(() => {
    setLockupDeploy('loading');
    dispatch(
      walletActions.deployWallet({
        onDone: () => setLockupDeploy('deployed'),
        onFail: () => setLockupDeploy('deploy'),
      }),
    );
  }, [dispatch]);

  const handleOpenExplorer = useCallback(async () => {
    await delay(200);
    openDAppBrowser(
      address.ton
        ? getServerConfig('accountExplorer').replace('%s', address.ton)
        : getServerConfig('explorerUrl'),
    );
  }, [address.ton]);

  const handleLoadMore = useCallback(() => {
    if (isEventsLoading || !canLoadMore) {
      return;
    }

    dispatch(eventsActions.loadEvents({ isLoadMore: true }));
  }, [dispatch, isEventsLoading, canLoadMore]);

  const isEventsLoadingMore = !isRefreshing && isEventsLoading && !!wallet;

  const renderFooter = useCallback(() => {
    return (
      <>
        {isEventsLoadingMore ? (
          <BalancesStyle.LoaderMoreWrap>
            <Loader size="medium" />
          </BalancesStyle.LoaderMoreWrap>
        ) : null}
        <BalancesStyle.BottomSpace />
      </>
    );
  }, [isEventsLoadingMore]);

  const renderContent = useCallback(() => {
    return (
      <TransactionsList
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            tintColor={theme.colors.foregroundPrimary}
          />
        }
        withoutMarginForFirstHeader
        initialData={[]}
        onEndReached={isEventsLoading || !canLoadMore ? undefined : handleLoadMore}
        eventsInfo={filteredEventsInfo}
        contentContainerStyle={{
          paddingHorizontal: ns(16),
          paddingBottom,
        }}
        renderFooter={renderFooter}
        renderHeader={
          <S.Header>
            <S.TokenInfoWrap>
              <S.FlexRow>
                <S.AmountWrapper>
                  <HideableAmount variant="h2">
                    {formatter.format(amount, {
                      currency: currencyUpper,
                      currencySeparator: 'wide',
                      decimals: Decimals[currency]!,
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
            <S.ChartWrap>
              <Chart />
            </S.ChartWrap>
            <S.Divider style={{ marginBottom: ns(22) }} />
            <S.ExploreWrap>
              <Text
                style={{ marginBottom: ns(14) }}
                variant="h3"
                color="foregroundPrimary"
              >
                {t('wallet_about')}
              </Text>
              <S.ExploreButtons>
                {exploreActions.map((action) => (
                  <Button
                    onPress={() => handleOpenAction(action)}
                    key={action.text}
                    before={
                      <Icon
                        name={action.icon}
                        color="foregroundPrimary"
                        style={{ marginRight: 8 }}
                      />
                    }
                    style={{ marginRight: 8, marginBottom: 8 }}
                    mode="secondary"
                    size="medium_rounded"
                  >
                    {action.text}
                  </Button>
                ))}
              </S.ExploreButtons>
            </S.ExploreWrap>
            {wallet && wallet.ton.isLockup() && (
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
          </S.Header>
        }
      />
    );
  }, [
    handleRefresh,
    isRefreshing,
    theme.colors.foregroundPrimary,
    isEventsLoading,
    canLoadMore,
    handleLoadMore,
    filteredEventsInfo,
    paddingBottom,
    renderFooter,
    amount,
    currencyUpper,
    currency,
    tokenPrice,
    handleSend,
    t,
    handleReceive,
    handleOpenExchange,
    flags.disable_swap,
    handlePressSwap,
    wallet,
    handleDeploy,
    lockupDeploy,
    handleOpenAction,
  ]);

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
    <S.Wrap>
      <ScrollHandler
        navBarRight={
          <PopupMenu
            items={[
              <PopupMenuItem
                shouldCloseMenu
                onPress={handleOpenExplorer}
                text={t('jetton_open_explorer')}
                icon={<Icon name="ic-globe-16" color="accentPrimary" />}
              />,
            ]}
          >
            <S.HeaderViewDetailsButton onPress={() => null}>
              <Icon name="ic-ellipsis-16" color="foregroundPrimary" />
            </S.HeaderViewDetailsButton>
          </PopupMenu>
        }
        isLargeNavBar={false}
        navBarTitle={'Toncoin'}
      >
        {renderContent()}
      </ScrollHandler>
    </S.Wrap>
  );
};

export function openWallet(currency: CryptoCurrency) {
  _.throttle(() => {
    navigate(MainStackRouteNames.Wallet, {
      currency,
    });
  }, 1000)();
}
