import React, { memo, useCallback, useEffect, useState } from 'react';
import { t } from '$translation';
import {
  Button,
  IconButton,
  IconButtonList,
  InternalNotification,
  Screen,
  Text,
  View,
} from '$uikit';
import { List } from '$uikit/List/new';
import { Steezy } from '$styles';
import { useNavigation } from '$libs/navigation';
import { ScanQRButton } from '../../components/ScanQRButton';
import { RefreshControl } from 'react-native';
import { NFTCardItem } from './NFTCardItem';
import { useDispatch, useSelector } from 'react-redux';
import { openRequireWalletModal, openWallet } from '$navigation';
import { maskifyAddress } from '$utils';
import { walletActions, walletSelector } from '$store/wallet';
import { copyText } from '$hooks/useCopyText';
import { useIsFocused } from '@react-navigation/native';
import _ from 'lodash';
import { useBalance } from './hooks/useBalance';
import { ListItemRate } from './components/ListItemRate';
import { TonIcon } from '../../components/TonIcon';
import { CryptoCurrencies } from '$shared/constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Tabs } from './components/Tabs';
import * as S from '../../core/Balances/Balances.style';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useInternalNotifications } from './hooks/useInternalNotifications';
import { mainActions } from '$store/main';
import { TokenList } from './components/TokenList';
import { NFTsList } from './components/NFTsList';
import { useTonkens } from './hooks/useTokens';
import { useNFTs } from './hooks/useNFTs';
import { useWallet } from './hooks/useWallet';
import { useTheme } from '$hooks';
import { ApprovalCell } from '$core/ApprovalCell/components/ApprovalCell';

export const WalletScreen = memo(() => {
  const [tab, setTab] = useState<string>('tokens');
  const tabBarHeight = useBottomTabBarHeight();
  const dispatch = useDispatch();
  const theme = useTheme();
  const nav = useNavigation();
  const tokens = useTonkens();
  const nfts = useNFTs();
  const wallet = useWallet();

  const balance = useBalance();

  const { isRefreshing, isLoaded } = useSelector(walletSelector);
  const isFocused = useIsFocused();
  
  const notifications = useInternalNotifications();

  // TODO: rewrite
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(mainActions.mainStackInited());
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const handlePressSell = React.useCallback(() => {
    if (wallet) {
      nav.openModal('Exchange', { category: 'sell' });
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

  const handlePressSend = React.useCallback(() => {
    if (wallet) {
      nav.go('Send', {});
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);

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

  const handleCreateWallet = () => openRequireWalletModal();

  const handleRefresh = useCallback(() => {
    dispatch(walletActions.refreshBalancesPage(true));
  }, [dispatch]);

  const balanceSection = (
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
      <View style={styles.amount} pointerEvents="box-none">
        <Text variant="num2">
          {balance.fiatValue}
        </Text>
        {wallet && (
          <TouchableOpacity 
            style={{ zIndex: 3 }}
            onPress={() => copyText(wallet.address.friendlyAddress)}
            activeOpacity={0.6}
          >
            <Text
              style={styles.addressText.static} 
              color="textSecondary"
              variant="body2"
            >
              {maskifyAddress(wallet.address.friendlyAddress)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <IconButtonList>
        <IconButton
          onPress={handlePressBuy}
          iconName="ic-plus-28"
          title={t('wallet.buy_btn')}
        />
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
        {+balance.amount > 0 && (
          <IconButton
            onPress={handlePressSell}
            iconName="ic-minus-28"
            title={t('wallet.sell_btn')}
          />
        )}
      </IconButtonList>
      <ApprovalCell />
    </View>
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
          {balanceSection}

          <List>
            <List.Item
              title="Toncoin"
              onPress={() => openWallet(CryptoCurrencies.Ton)}
              leftContent={<TonIcon />}
              chevron
              subtitle={
                <ListItemRate
                  price={balance.fiatPrice}
                  trend={balance.trend}
                />
              }
            />
          </List>
        </Screen.ScrollView>
        {isLoaded && !wallet && (
          <S.CreateWalletButtonWrap style={{ bottom: tabBarHeight }}>
            <S.CreateWalletButtonContainer skipHeader={false}>
              <Button onPress={handleCreateWallet}>{t('balances_setup_wallet')}</Button>
            </S.CreateWalletButtonContainer>
          </S.CreateWalletButtonWrap>
        )}
      </>
    );
  }

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
            {balanceSection}
            <Tabs.Bar
              onChange={({ value }) => setTab(value)}
              value={tab}
              items={[
                { label: t('wallet.tonkens_tab_lable'), value: 'tokens',  },
                { label: t('wallet.collectibles_tab_lable'), value: 'collectibles' }
              ]}
            />
          </Tabs.Header>
          <Tabs.PagerView>
            <Tabs.Section index={0}>
              <Tabs.ScrollView
                refreshControl={
                  <RefreshControl
                    onRefresh={handleRefresh}
                    refreshing={isRefreshing && isFocused}
                    tintColor={theme.colors.foregroundPrimary}
                  />
                }
              >
                <TokenList balance={balance} tokens={tokens} />
              </Tabs.ScrollView>
            </Tabs.Section>
            <Tabs.Section index={1}>
              <Tabs.FlashList
                refreshControl={
                  <RefreshControl
                    onRefresh={handleRefresh}
                    refreshing={isRefreshing && isFocused}
                    tintColor={theme.colors.foregroundPrimary}
                  />
                }
                data={nfts}
                numColumns={3}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                estimatedItemSize={1000}
                renderItem={({ item }) => (
                  <NFTCardItem item={item} />
                )}                
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
        <Screen.ScrollView
          indent={false}
          refreshControl={
            <RefreshControl
              onRefresh={handleRefresh}
              refreshing={isRefreshing && isFocused}
              tintColor={theme.colors.foregroundPrimary}
            />
          }
        >
          {balanceSection}
          <TokenList balance={balance} tokens={tokens} />
          <NFTsList nfts={nfts} />
        </Screen.ScrollView>
      </>
    );
  }

  if (!wallet) {
    return (
      <Screen>
        {renderEmpty()}
      </Screen>
    );
  } else if (tokens.list.length + nfts.length + 1 > 10) {
    return (
      <Screen>
        {renderTabs()}
      </Screen>
    );
  } else {
    return (
      <Screen>
        {renderCompact()}
      </Screen>
    );
  }
});

const styles = Steezy.create({
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
    marginBottom: 24.5
  },
  addressText: {
    marginTop: 7.5
  },
});
