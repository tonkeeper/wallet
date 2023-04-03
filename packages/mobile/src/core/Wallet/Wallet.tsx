import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { WalletProps } from './Wallet.interface';
import * as S from './Wallet.style';
import * as BalancesStyle from '../Balances/Balances.style';
import { useTheme, useTranslator, useWalletInfo } from '$hooks';
import {
  Button,
  Icon,
  PopupMenu,
  PopupMenuItem,
  Text,
  ScrollHandler,
  IconButton,
  Loader,
} from '$uikit';
import {
  openDAppBrowser,
  openReceive,
  openRequireWalletModal,
  openSend,
} from '$navigation';
import {
  walletActions,
  walletAddressSelector,
  walletIsRefreshingSelector,
  walletWalletSelector,
} from '$store/wallet';
import { Linking, Platform, RefreshControl, View } from 'react-native';
import { ns } from '$utils';
import { CryptoCurrencies, Decimals, getServerConfig } from '$shared/constants';
import { t } from '$translation';
import { useNavigation } from '$libs/navigation';
import { Chart } from '$shared/components/Chart/new/Chart';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionsList } from '$core/Balances/TransactionsList/TransactionsList';
import { eventsActions, eventsSelector } from '$store/events';
import { groupAndFilterTonActivityItems } from '$utils/transactions';
import { formatter } from '$utils/formatter';
import { Toast } from '$store';

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
    text: 'ton.api',
    url: 'https://tonapi.io',
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
  const wallet = useSelector(walletWalletSelector);
  const address = useSelector(walletAddressSelector);
  const isRefreshing = useSelector(walletIsRefreshingSelector);
  const t = useTranslator();
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
            ['empty', 'uninit'].includes(info.status) ? 'deploy' : 'deployed',
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
  const { amount, formattedFiatAmount } = useWalletInfo(currency);

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

    openSend(currency);
  }, [currency, wallet]);

  const handleOpenExchange = useCallback(
    (category: 'buy' | 'sell') => () => {
      if (!wallet) {
        return openRequireWalletModal();
      }
      nav.openModal('Exchange', { category });
    },
    [nav, wallet],
  );

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

  const handleOpenExplorer = useCallback(() => {
    openDAppBrowser(getServerConfig('accountExplorer').replace('%s', address.ton));
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
                  <Text variant="h2">
                    {formatter.format(amount, {
                      currency: currencyUpper,
                      currencySeparator: 'wide',
                      decimals: Decimals[currency]!,
                    })}
                  </Text>
                  <Text
                    style={{ marginTop: 2 }}
                    variant="body2"
                    color="foregroundSecondary"
                  >
                    {formattedFiatAmount}
                  </Text>
                </S.AmountWrapper>
                <S.IconWrapper>
                  <Icon size={40} name="ic-ton-28" color="constantLight" />
                </S.IconWrapper>
              </S.FlexRow>
              <S.Divider style={{ marginBottom: ns(16) }} />
              <S.ActionsContainer>
                <IconButton
                  onPress={handleOpenExchange('buy')}
                  iconName="ic-plus-28"
                  title={t('wallet.buy_btn')}
                />
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
                  onPress={handleOpenExchange('sell')}
                  iconName="ic-minus-28"
                  title={t('wallet.sell_btn')}
                />
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
    formattedFiatAmount,
    handleOpenExchange,
    t,
    handleSend,
    handleReceive,
    wallet,
    handleDeploy,
    lockupDeploy,
    handleOpenAction,
  ]);

  return (
    <S.Wrap>
      <ScrollHandler
        navBarRight={
          <PopupMenu
            items={[
              <PopupMenuItem
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
