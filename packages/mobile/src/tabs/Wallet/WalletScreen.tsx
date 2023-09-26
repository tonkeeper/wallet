import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import {
  Button,
  IconButton,
  IconButtonList,
  InternalNotification,
  Screen,
  Text,
  List,
  View,
  SwapIcon,
} from '$uikit';
import { useNavigation } from '@tonkeeper/router';
import { ScanQRButton } from '../../components/ScanQRButton';
import { RefreshControl, useWindowDimensions } from 'react-native';
import { NFTCardItem } from './NFTCardItem';
import { useDispatch, useSelector } from 'react-redux';
import { ns } from '$utils';
import { walletActions, walletSelector } from '$store/wallet';
import { copyText } from '$hooks/useCopyText';
import { useIsFocused } from '@react-navigation/native';
import { useBalance } from './hooks/useBalance';
import { ListItemRate } from './components/ListItemRate';
import { TonIcon } from '@tonkeeper/uikit';
import { CryptoCurrencies, IsTablet, TabletMaxWidth } from '$shared/constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Tabs } from './components/Tabs';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { useInternalNotifications } from './hooks/useInternalNotifications';
import { mainActions } from '$store/main';
import { useTonkens } from './hooks/useTokens';
import { useWallet } from './hooks/useWallet';
import { useApprovedNfts } from '$hooks/useApprovedNfts';
import { useTheme } from '$hooks/useTheme';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { ApprovalCell } from '$core/ApprovalCell/components/ApprovalCell';
import { Steezy } from '$styles';
import { BalancesList } from './components/BalancesList';
import { useFlags } from '$utils/flags';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { UpdatesCell } from '$core/ApprovalCell/Updates/UpdatesCell';
import { UpdateState } from '$store/zustand/updates/types';
import { ShowBalance } from '$core/HideableAmount/ShowBalance';
import { Events, SendAnalyticsFrom } from '$store/models';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { openWallet } from '$core/Wallet/ToncoinScreen';
import { trackEvent } from '$utils/stats';
import { useTronBalances } from '@tonkeeper/shared/query/hooks/useTronBalances';
import { tk } from '@tonkeeper/shared/tonkeeper';

export const WalletScreen = memo(() => {
  const flags = useFlags(['disable_swap']);
  const [tab, setTab] = useState<string>('tokens');
  const tabBarHeight = useBottomTabBarHeight();
  const dispatch = useDispatch();
  const theme = useTheme();
  const nav = useNavigation();
  const tokens = useTonkens();
  const { enabled: nfts } = useApprovedNfts();
  const wallet = useWallet();
  const shouldUpdate =
    useUpdatesStore((state) => state.update.state) !== UpdateState.NOT_STARTED;
  const balance = useBalance(tokens.total.fiat);
  const tonPrice = useTokenPrice(CryptoCurrencies.Ton);

  const { isRefreshing, isLoaded } = useSelector(walletSelector);
  const isFocused = useIsFocused();

  const { data: tronBalances } = useTronBalances();

  const notifications = useInternalNotifications();

  // TODO: rewrite
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(mainActions.mainStackInited());
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const handlePressSwap = React.useCallback(() => {
    if (wallet) {
      nav.openModal('Swap');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handlePressBuy = React.useCallback(() => {
    if (wallet) {
      nav.openModal('Exchange');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handlePressSend = React.useCallback(() => {
    if (wallet) {
      trackEvent(Events.SendOpen, { from: SendAnalyticsFrom.WalletScreen });
      nav.go('Send', { from: SendAnalyticsFrom.WalletScreen });
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handlePressRecevie = React.useCallback(() => {
    if (wallet) {
      nav.go('ReceiveModal');
    } else {
      openRequireWalletModal();
    }
  }, [nav, wallet]);

  const handleCreateWallet = () => openRequireWalletModal();

  const handleRefresh = useCallback(() => {
    dispatch(walletActions.refreshBalancesPage(true));
  }, [dispatch]);

  const ListHeader = useCallback(
    (visibleApproval?: boolean) => (
      <View style={styles.mainSection} pointerEvents="box-none">
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
        {shouldUpdate && <UpdatesCell />}
        <View style={styles.amount} pointerEvents="box-none">
          <ShowBalance amount={balance.total.fiat} />
          <View style={styles.walletSpace} />
          {wallet && tk.wallet && (
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 18, right: 18 }}
              style={{ zIndex: 3 }}
              onPress={() => copyText(tk.wallet.address.ton.friendly)}
              activeOpacity={0.6}
            >
              <Text color="textSecondary" variant="body2">
                {tk.wallet.address.ton.short}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <IconButtonList>
          <IconButton
            onPress={handlePressSend}
            iconName="ic-arrow-up-28"
            title={t('wallet.send_btn')}
          />
          <IconButton
            onPress={handlePressRecevie}
            iconName="ic-arrow-down-28"
            title={t('wallet.receive_btn')}
          />
          <IconButton
            onPress={handlePressBuy}
            iconName="ic-plus-28"
            title={t('wallet.buy_btn')}
          />
          {!flags.disable_swap && (
            <IconButton
              onPress={handlePressSwap}
              icon={<SwapIcon animated />}
              title={t('wallet.swap_btn')}
            />
          )}
        </IconButtonList>
        {wallet && visibleApproval && <ApprovalCell />}
      </View>
    ),
    [
      balance.total.fiat,
      flags.disable_swap,
      handlePressBuy,
      handlePressRecevie,
      handlePressSend,
      handlePressSwap,
      notifications,
      shouldUpdate,
      wallet,
    ],
  );

  function renderEmpty() {
    return (
      <>
        <Screen.Header
          backButton={false}
          title={t('wallet.screen_title')}
          rightContent={<ScanQRButton />}
        />
        <Screen.ScrollView indent={false}>
          {ListHeader()}
          <List>
            <List.Item
              title="Toncoin"
              onPress={() => openWallet(CryptoCurrencies.Ton)}
              leftContent={<TonIcon />}
              chevron
              subtitle={
                <ListItemRate
                  price={tonPrice.formatted.fiat ?? '-'}
                  trend={tonPrice.fiatDiff.trend}
                />
              }
            />
          </List>
        </Screen.ScrollView>
        {isLoaded && !wallet && (
          <View style={[styles.createWalletContainerOuter, { bottom: tabBarHeight }]}>
            <View style={styles.createWalletContainerInner}>
              <Button onPress={handleCreateWallet}>{t('balances_setup_wallet')}</Button>
            </View>
          </View>
        )}
      </>
    );
  }

  // TODO: rewrite
  const dimensions = useWindowDimensions();
  const mockupCardSize = {
    width: ns(114),
    height: ns(166),
  };

  const numColumn = 3;
  const indent = ns(8);
  const heightRatio = mockupCardSize.height / mockupCardSize.width;

  const nftCardSize = useMemo(() => {
    const width = dimensions.width / numColumn - indent;
    const height = width * heightRatio;

    return { width, height };
  }, [dimensions.width]);

  function renderTabs() {
    return (
      <Tabs>
        <Screen.Header
          backButton={false}
          title={t('wallet.screen_title')}
          rightContent={<ScanQRButton />}
        />
        <View style={{ flex: 1 }}>
          <Tabs.Header>
            {ListHeader()}
            <Tabs.Bar
              onChange={({ value }) => setTab(value)}
              value={tab}
              items={[
                { label: t('wallet.tonkens_tab_lable'), value: 'tokens' },
                { label: t('wallet.collectibles_tab_lable'), value: 'collectibles' },
              ]}
            />
          </Tabs.Header>
          <Tabs.PagerView>
            <Tabs.Section index={0}>
              <BalancesList
                ListHeaderComponent={
                  wallet ? (
                    <ApprovalCell
                      withoutSpacer
                      style={{ paddingHorizontal: ns(16), paddingBottom: ns(16) }}
                    />
                  ) : undefined
                }
                balance={balance}
                tronBalances={tronBalances}
                tokens={tokens}
                tonPrice={tonPrice}
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                isFocused={isFocused}
              />
            </Tabs.Section>
            <Tabs.Section index={1}>
              <Tabs.FlashList
                ListHeaderComponent={
                  wallet ? (
                    <ApprovalCell
                      withoutSpacer
                      style={{ paddingHorizontal: ns(6), paddingBottom: ns(16) }}
                    />
                  ) : undefined
                }
                contentContainerStyle={styles.scrollContainer.static}
                estimatedItemSize={1000}
                numColumns={3}
                data={nfts}
                renderItem={({ item }) => (
                  <View style={nftCardSize}>
                    <NFTCardItem item={item} />
                  </View>
                )}
                refreshControl={
                  <RefreshControl
                    onRefresh={handleRefresh}
                    refreshing={isRefreshing && isFocused}
                    tintColor={theme.colors.foregroundPrimary}
                    progressBackgroundColor={theme.colors.foregroundPrimary}
                  />
                }
              />
            </Tabs.Section>
          </Tabs.PagerView>
        </View>
      </Tabs>
    );
  }

  function renderCompact() {
    return (
      <>
        <Screen.Header
          backButton={false}
          title={t('wallet.screen_title')}
          rightContent={<ScanQRButton />}
        />
        <BalancesList
          tronBalances={tronBalances}
          ListHeaderComponent={ListHeader(true)}
          handleRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isFocused={isFocused}
          balance={balance}
          tokens={tokens}
          tonPrice={tonPrice}
          nfts={nfts}
        />
      </>
    );
  }

  if (!wallet) {
    return <Screen>{renderEmpty()}</Screen>;
  } else if (tokens.list.length <= 2) {
    return <Screen>{renderCompact()}</Screen>;
  } else if (nfts.length && tokens.list.length + nfts.length + 1 > 10) {
    return <Screen>{renderTabs()}</Screen>;
  } else {
    return <Screen>{renderCompact()}</Screen>;
  }
});

const styles = Steezy.create(({ colors, corners, isTablet }) => ({
  container: {
    position: 'relative',
  },
  mainSection: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  amount: {
    paddingTop: 29,
    alignItems: 'center',
    marginBottom: 24.5,
  },
  walletSpace: {
    marginTop: 7.5,
  },
  scrollContainer: {
    paddingHorizontal: 12,
  },
  createWalletContainerOuter: {
    padding: 16,
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    [isTablet]: {
      alignItems: 'center',
    },
  },
  createWalletContainerInner: {
    bottom: 0,
    [isTablet]: {
      width: TabletMaxWidth,
    },
  },
}));
