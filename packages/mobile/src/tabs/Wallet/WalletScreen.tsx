import React, { memo, useCallback, useState } from 'react';
import { t } from '$translation';
import { Button, IconButton, IconButtonList, Screen, Text, View } from '$uikit';
import { List } from '$uikit/List/new';
import { Steezy } from '$styles';
import { useNavigation } from '$libs/navigation';
import { ScanQRButton } from '../../components/ScanQRButton';
import { RefreshControl } from 'react-native';
import { useJettonBalances, useTheme } from '$hooks';
import TonWeb from 'tonweb';
import { NFTCardItem } from './NFTCardItem';
import { useDispatch, useSelector } from 'react-redux';
import { nftsSelector } from '$store/nfts';
import { openJetton, openJettonsList, openWallet } from '$navigation';
import { formatAmountAndLocalize, maskifyAddress, statusBarHeight } from '$utils';
import { walletActions, walletSelector, walletWalletSelector } from '$store/wallet';
import { copyText } from '$hooks/useCopyText';
import { useIsFocused } from '@react-navigation/native';
import _ from 'lodash';
import { useBalance } from './hooks/useBalance';
import { ListItemRate } from './components/ListItemRate';
import { TonIcon } from '../../components/TonIcon';
import { CryptoCurrencies } from '$shared/constants';
import Animated from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Tabs } from './components/Tabs';

type TokenInfo = {
  address: WalletAddress;
  name?: string;
  symbol?: string;
  description?: string;
  iconUrl?: string;
  decimals: number;
  quantity: {
    value: string;
    formatted: string;
  };
}

type WalletAddress = {
  friendlyAddress: string;
  rawAddress: string;
  version: WalletVersion;
}

type WalletVersion = 'v3R1' | 'v4R2';

const useTonkens = (): { 
  list: TokenInfo[];
} => {
  const jettonBalances = useJettonBalances();

  const tonkens = jettonBalances.map((item) => {
    const tokenInfo: TokenInfo = {
      address: {
        friendlyAddress: new TonWeb.utils.Address(item.jettonAddress).toString(true, true, true),
        rawAddress: item.jettonAddress,
        version: 'v3R1',
      },
      name: item.metadata.name,
      symbol: item.metadata.symbol,
      description: item.metadata.description,
      iconUrl: item.metadata.image,
      decimals: item.metadata.decimals,
      quantity: {
        value: item.balance,
        formatted: formatAmountAndLocalize(item.balance, 2),
      }
    };

    return tokenInfo;
  }) as TokenInfo[];

  return {
    list: tonkens,
  }
}

const useNFTs = () => {
  const { myNfts } = useSelector(nftsSelector);

  const nfts = Object.values(myNfts).map((item) => {
    return item;
  });

  return nfts;
};

const useWallet = () => {
  const wallet = useSelector(walletWalletSelector);
  const [address, setAddress] = React.useState<{
    friendlyAddress: string;
    rawAddress: string;
    version: string;
  } | null>(null);

  React.useEffect(() => {
    (async () => {
      if (wallet) {
        const rawAddress = await wallet.vault.getRawTonAddress();
        const friendlyAddress = await wallet.vault.getTonAddress();

        if (rawAddress && friendlyAddress) {
          setAddress({
            friendlyAddress, 
            rawAddress,
            version: 'v3R1'
          });
        }
        
      }
    })();
  }, []);

  if (wallet && address) {
    return { address };
  }

  return null;
};

export const WalletScreen = memo(() => {
  const [tab, setTab] = useState<string>('tokens');
  const dispatch = useDispatch();
  const theme = useTheme();
  const nav = useNavigation();
  const tokens = useTonkens();
  const nfts = useNFTs();
  const wallet = useWallet();

  const balance = useBalance();

  const { isRefreshing } = useSelector(walletSelector);
  const isFocused = useIsFocused();
  
  const handlePressSell = () => nav.openModal('Exchange', { category: 'sell' });
  const handlePressBuy = () => nav.openModal('Exchange', { category: 'buy' });
  const handlePressSend = () => nav.go('Send', {});
  const handlePressRecevie = () => nav.go('Receive', { 
    currency: 'ton',
    isFromMainScreen: true
  });

  const handleRefresh = useCallback(() => {
    dispatch(walletActions.refreshBalancesPage(true));
  }, [dispatch]);

  const balanceSection = (
    <View style={styles.mainSection}>
      <View style={styles.amount}>
        <Text variant="num2">
          {balance.fiatValue}
        </Text>
        {wallet && (
          <TouchableOpacity 
            style={{ zIndex: 3 }}
            onPress={() => copyText(wallet.address.friendlyAddress)}
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
          title="Buy"
        />
        <IconButton
          onPress={handlePressSend}
          iconName="ic-arrow-up-28"
          title="Send"
        />
        <IconButton
          onPress={handlePressRecevie}
          iconName="ic-arrow-down-28"
          title="Receive"
        />
        {+balance.amount > 0 && (
          <IconButton
            onPress={handlePressSell}
            iconName="ic-minus-28"
            title="Sell"
          />
        )}
      </IconButtonList>
    </View>
  );

  function renderContent() {
    if (!wallet) {
      return null;
    }

    const isTabs = true;

    if (isTabs) {
      return (
        <>
          <Tabs.Header>
            {balanceSection}
            <Tabs.Bar
              onChange={({ value }) => setTab(value)}
              value={tab}
              items={[
                { label: 'Tokens', value: 'tokens',  },
                { label: 'Collectibles', value: 'collectibles' }
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
                {/* <NFTsList nfts={nfts} /> */}
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
        </>
      );
    } else {
      return (
        <Animated.ScrollView
          refreshControl={
            <RefreshControl
              onRefresh={handleRefresh}
              refreshing={isRefreshing && isFocused}
              tintColor={theme.colors.foregroundPrimary}
            />
          }
        >
          <TokenList balance={balance} tokens={tokens} />
          <NFTsList nfts={nfts} />
        </Animated.ScrollView>
      );
    }
  }
  
  return (
    <Screen>
      <Screen.Header 
        backButton={false} 
        title={t('wallet.screen_title')}
        rightContent={<ScanQRButton />}
      />
      <Tabs>
        {renderContent()}
      </Tabs>
    </Screen>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    position: 'relative',
  },
  mainSection: {
    paddingTop: 29,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  amount: {
    alignItems: 'center',
    marginBottom: 24.5
  },
  addressText: {
    marginTop: 7.5
  },
  tonkensEdit: {
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16
  },
  nftElements: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12
  }
}));


const TokenList = ({
  tokens,
  balance,
}: any) => {
  const dispatch = useDispatch();

  const handleMigrate = useCallback((fromVersion: string) => () => {
    dispatch(
      walletActions.openMigration({
        isTransfer: true,
        fromVersion,
      }),
    );
  }, []);

  return (
    <View>
      <List>
        <List.Item
          title="Toncoin"
          onPress={() => openWallet(CryptoCurrencies.Ton)}
          value={balance.formattedAmount}
          subvalue={balance.fiatValue}
          leftContent={<TonIcon />}
          subtitle={
            <ListItemRate
              percent={balance.percent}
              price={balance.fiatPrice}
              trend={balance.trend}
            />
          }
        />
        {tokens.list.map((item) => (
          <List.Item 
            key={item.address.rawAddress}
            onPress={() => openJetton(item.address.rawAddress)}
            picture={item.iconUrl}
            title={item.name}
            value={item.quantity.formatted}
            label={item.symbol}
            // TODO:
            // subvalue={item.rate?.fiatValue}
            // subtitle={item.rate && (
            //   <ListItemRate
            //     percent={item.rate.percent}
            //     price={item.rate.fiatPrice}
            //     trend={item.rate.trend}
            //   />
            // )}
          />
        ))}
        {balance.oldVersions.map((item, key) => (
          <List.Item 
            key={`old-balance-${key}`}
            onPress={handleMigrate(item.version)}
            title={t('wallet.old_wallet_title')}
            leftContent={<TonIcon transparent />}
            value={item.amount.formatted}
            subvalue={item.amount.fiat}
            subtitle={
              <ListItemRate
                percent={balance.percent}
                price={balance.fiatPrice}
                trend={balance.trend}
              />
            }
          />
        ))}
      </List>
      {tokens.list.length > 0 && (
        <View style={styles.tonkensEdit}>
          <Button 
            onPress={() => openJettonsList()}
            size="medium_rounded"
            mode="secondary"
          >
            {t('wallet.edit_tokens_btn')}
          </Button>
        </View>
      )}
    </View>
  )
};

const NFTsList = ({ nfts }: any) => {
  return (
    <View style={styles.nftElements}>
      {nfts.map((item, key) => (
        <NFTCardItem
          item={item}
          key={key}
        />
      ))}
    </View> 
  );
}


