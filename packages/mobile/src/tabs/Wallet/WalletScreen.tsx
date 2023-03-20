import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { t } from '$translation';
import {
  Button,
  IconButton,
  IconButtonList,
  InternalNotification,
  Screen,
  Spacer,
  SpacerSizes,
  Text,
  View,
} from '$uikit';
import { List } from '$uikit/List/new';
import { Steezy } from '$styles';
import { useNavigation } from '$libs/navigation';
import { ScanQRButton } from '../../components/ScanQRButton';
import { RefreshControl, useWindowDimensions } from 'react-native';
import { NFTCardItem } from './NFTCardItem';
import { useDispatch, useSelector } from 'react-redux';
import { openJetton, openJettonsList, openRequireWalletModal, openWallet } from '$navigation';
import { maskifyAddress, ns } from '$utils';
import { walletActions, walletSelector } from '$store/wallet';
import { copyText } from '$hooks/useCopyText';
import { useIsFocused } from '@react-navigation/native';
import _ from 'lodash';
import { Rate, useBalance, useRates } from './hooks/useBalance';
import { ListItemRate } from './components/ListItemRate';
import { TonIcon, TonIconProps } from '../../components/TonIcon';
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
import { ListSeparator } from '$uikit/List/new/ListSeparator';
import { FlashList } from '@shopify/flash-list';

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
  const rates = useRates();

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
        isFromMainScreen: true,
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
        <Text variant="num2">{balance.total.fiat}</Text>
        {wallet && (
          <TouchableOpacity
            style={{ zIndex: 3 }}
            onPress={() => copyText(wallet.address.friendlyAddress)}
            activeOpacity={0.6}
          >
            <Text style={styles.addressText.static} color="textSecondary" variant="body2">
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
        {+balance.ton.amount.nano > 0 && (
          <IconButton
            onPress={handlePressSell}
            iconName="ic-minus-28"
            title={t('wallet.sell_btn')}
          />
        )}
      </IconButtonList>
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
              subtitle={<ListItemRate price={rates.ton.price} trend={rates.ton.trend} />}
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

  // TODO: rewrite
  const dimensions = useWindowDimensions();
  const mockupCardSize = {
    width: ns(114),
    height: ns(166)
  };
  
  const numColumn = 3;
  const indent = ns(8);
  const heightRatio = mockupCardSize.height / mockupCardSize.width;

  const nftCardSize = useMemo(() => {
    const width = (dimensions.width / numColumn) - indent;
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
            {balanceSection}
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
                balance={balance} 
                tokens={tokens} 
                rates={rates}
                handleRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                isFocused={isFocused}
              />
            </Tabs.Section>
            <Tabs.Section index={1}>
              <Tabs.FlashList
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
          balance={balance} 
          tokens={tokens} 
          rates={rates} 
          nfts={nfts}
          handleRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isFocused={isFocused}
          balancesSection={balanceSection}
        />
      </>
    );
  }

  if (!wallet) {
    return <Screen>{renderEmpty()}</Screen>;
  } else if (tokens.list.length <= 2) {
    return <Screen>{renderCompact()}</Screen>;
  } else if (tokens.list.length + nfts.length + 1 > 10) {
    return <Screen>{renderTabs()}</Screen>;
  } else {
    return <Screen>{renderCompact()}</Screen>;
  }
});

enum ContentType {
  Token,
  Collectibles,
  Spacer,
  EditTokensButton,
  NFTCardsRow
}

type TokenItem = {
  type: ContentType.Token;

  isFirst?: boolean;
  isLast?: boolean

  onPress?: () => void;
  title: string;
  subtitle?: string;
  value: string;
  subvalue: string;
  rate?: Rate;
  picture?: string;
  tonIcon?: boolean | TonIconProps;
};

type SpacerItem = {
  type: ContentType.Spacer;
  bottom: SpacerSizes;
}

type EditTokensButtonItem = {
  type: ContentType.EditTokensButton;
}

type NFTCardsRowItem = {
  type: ContentType.NFTCardsRow;
  items: any; // TODO:
}

type Content = 
  | TokenItem 
  | SpacerItem
  | EditTokensButtonItem
  | NFTCardsRowItem;

const RenderItem = ({ item }: { item: Content }) => {
  switch (item.type) {
    case ContentType.Token:
      const renderLeftContent = () => {
        if (typeof item.tonIcon === 'object') {
          return <TonIcon {...item.tonIcon} />;
        } else if (typeof item.tonIcon === 'boolean') {
          return <TonIcon />;
        }
      };

      const containerStyle = [
        item.isFirst && styles.firstListItem,
        item.isLast && styles.lastListItem,
        styles.containerListItem
      ];

      return (
        <View style={containerStyle}>
          <List.Item
            leftContent={renderLeftContent()}
            onPress={item.onPress}
            title={item.title}
            picture={item.picture}
            value={item.value}
            subvalue={item.subvalue}
            subtitle={
              item.rate ? (
                <ListItemRate
                  percent={item.rate.percent}
                  price={item.rate.price}
                  trend={item.rate.trend}
                />
              ) : (
                item.subtitle
              )
            }
          />
          {!item.isLast && <ListSeparator />}
        </View>
      );
    case ContentType.Spacer:
      return <Spacer y={item.bottom}/>;
    case ContentType.EditTokensButton: 
      return (
        <View style={styles.tonkensEdit}>
          <Button 
            onPress={() => openJettonsList()}
            size="medium_rounded"
            mode="secondary"
          >
            {t('wallet.edit_tokens_btn')}
          </Button>
        </View>
      );
    case ContentType.NFTCardsRow:
      return (
        <NFTsList nfts={item.items} />
      );
  }
};


// See https://shopify.github.io/flash-list/docs/fundamentals/performant-components#getitemtype
const BalancesList = ({ 
  tokens, 
  balance, 
  rates, 
  nfts, 
  handleRefresh,
  isRefreshing,
  isFocused,
  balancesSection
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  

  const handleMigrate = useCallback(
    (fromVersion: string) => () => {
      dispatch(
        walletActions.openMigration({
          isTransfer: true,
          fromVersion,
        }),
      );
    },
    [],
  );

  const data = useMemo(() => {
    const content: Content[] = [];

    // Tokens
    content.push({
      type: ContentType.Token,
      title: 'Toncoin',
      onPress: () => openWallet(CryptoCurrencies.Ton),
      value: balance.ton.amount.formatted,
      subvalue: balance.ton.amount.fiat,
      tonIcon: true,
      rate: {
        percent: rates.ton.percent,
        price: rates.ton.price,
        trend: rates.ton.trend,
      },
    });

    content.push(
      ...balance.oldVersions.map((item) => ({
        type: ContentType.Token,
        onPress: handleMigrate(item.version),
        title: t('wallet.old_wallet_title'),
        tonIcon: { transparent: true },
        value: item.amount.formatted,
        subvalue: item.amount.fiat,
        rate: {
          percent: rates.ton.percent,
          price: rates.ton.price,
          trend: rates.ton.trend,
        },
      })),
    );

    content.push(
      ...tokens.list.map((item) => ({
        type: ContentType.Token,
        onPress: () => openJetton(item.address.rawAddress),
        picture: item.iconUrl,
        title: item.name,
        value: item.quantity.formatted,
        label: item.symbol,
      }))
    );

    // Make list
    content[0].isFirst = true;
    content[content.length - 1].isLast = true;

    content.push({
      type: ContentType.Spacer,
      bottom: 16
    });

    content.push({
      type: ContentType.EditTokensButton
    });

    if (nfts) {
      const numColumns = 3;
      for (let i = 0; i < Math.ceil(nfts.length / numColumns); i++) {
        content.push({ 
          type: ContentType.NFTCardsRow,
          items: nfts.slice((i * numColumns), (i * numColumns) + numColumns)
        })
      }

      content.push({
        type: ContentType.Spacer,
        bottom: 12
      });
    }

    return content;
  }, [balance.oldVersions, rates, tokens.list]);

  const ListComponent = nfts ? Screen.FlashList : Tabs.FlashList;

  return (
    <ListComponent
      estimatedItemSize={500}
      data={data}
      getItemType={(item) => item.type}
      renderItem={RenderItem}
      // contentContainerStyle={{ paddingBottom: 12 }}
      ListHeaderComponent={balancesSection ?? undefined}
      refreshControl={
        <RefreshControl
          onRefresh={handleRefresh}
          refreshing={isRefreshing && isFocused}
          tintColor={theme.colors.foregroundPrimary}
        />
      }
    />
  );
};

const styles = Steezy.create(({ colors, corners }) => ({
  firstListItem: {
    borderTopLeftRadius: corners.medium,
    borderTopRightRadius: corners.medium,
  },
  lastListItem: {
    borderBottomLeftRadius: corners.medium,
    borderBottomRightRadius: corners.medium,
  },
  containerListItem: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
    marginHorizontal: 16,
  },

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
  addressText: {
    marginTop: 7.5,
  },
  scrollContainer: {
    paddingHorizontal: 12,
  },

  tonkensEdit: {
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 32
  },
}));
