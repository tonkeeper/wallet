import React, { memo, useCallback, useMemo } from 'react';
import { t } from '$translation';
import { IconButton, IconButtonList, Screen, Text, TouchableOpacity, View } from '$uikit';
import { List } from '$uikit/List/new';
import { Steezy } from '$styles';
import { useNavigation } from '$libs/navigation';
import { ScanQRButton } from '../../components/ScanQRButton';
import { Image, RefreshControl } from 'react-native';
import { useJettonBalances, useTheme, useWalletInfo } from '$hooks';
import TonWeb from 'tonweb';
import { NFTCardItem } from './NFTCardItem';
import { useDispatch, useSelector } from 'react-redux';
import { nftsSelector } from '$store/nfts';
import { openJetton, openWallet } from '$navigation';
import { maskifyAddress } from '$utils';
import { CryptoCurrencies, Decimals, FiatCurrencies } from '$shared/constants';
import { formatCryptoCurrency, formatFiatCurrencyAmount } from '$utils/currency';
import { ratesChartsSelector, ratesRatesSelector } from '$store/rates';
import { fiatCurrencySelector } from '$store/main';
import { getRate } from '$hooks/useFiatRate';
import { walletActions, walletSelector, walletWalletSelector } from '$store/wallet';
import { copyText } from '$hooks/useCopyText';
import { TonThemeColor } from '$styled';
import { useIsFocused } from '@react-navigation/native';

type TokenInfo = {
  address: WalletAddress;
  name?: string;
  symbol?: string;
  description?: string;
  iconUrl?: string;
  decimals: number;
  quantity: string;
}

type WalletAddress = {
  friendlyAddress: string;
  rawAddress: string;
  version: WalletVersion;
}

type WalletVersion = 'v3R1' | 'v4R2';

const useTonkens = (): TokenInfo[] => {
  const jettonBalances = useJettonBalances();

  return jettonBalances.map((item) => {
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
      quantity: item.balance
    };

    return tokenInfo;
  }) as TokenInfo[];
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

        setAddress({
          friendlyAddress, 
          rawAddress,
          version: 'v3R1'
        });
      }
    })();
  }, []);

  if (wallet && address) {
    return { address };
  }

  return null;
};



const useBalance = () => {
  const { amount, fiatInfo } = useWalletInfo(CryptoCurrencies.Ton);

  const currency = CryptoCurrencies.Ton;
  const charts = useSelector(ratesChartsSelector);
  const fiatCurrency = useSelector(fiatCurrencySelector);
  const rates = useSelector(ratesRatesSelector);

  const currencyPrepared = useMemo(() => {
    let result = currency;
    if (
      [CryptoCurrencies.TonLocked, CryptoCurrencies.TonRestricted].indexOf(currency) > -1
    ) {
      result = CryptoCurrencies.Ton;
    }

    return result;
  }, [currency]);

  const fiatPrice = useMemo(() => {
    const points = charts['ton'] || [];

    const fiatRate =
      fiatCurrency === FiatCurrencies.Usd
        ? 1
        : getRate(rates, CryptoCurrencies.Usdt, fiatCurrency);

    const price = points.length > 0 ? points[points.length - 1].y * fiatRate : 0;

    return formatFiatCurrencyAmount(price.toFixed(2), fiatCurrency);
  }, []);
    
  const formatedAmount = useMemo(() => {
    return formatCryptoCurrency(
      amount,
      '',
      Decimals[currencyPrepared],
      2,
      true,
    )
  }, []);

  return {
    fiatValue: fiatInfo.amount,
    percent: fiatInfo.percent,
    trend: fiatInfo.trend,
    formatedAmount,
    fiatPrice,
    amount,
  };
}

export const WalletScreen = memo((props) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const nav = useNavigation();
  const tokens = useTonkens();
  const nfts = useNFTs();
  const wallet = useWallet();

  const balance = useBalance();

  const {
    isRefreshing,
  } = useSelector(walletSelector);
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

  const trend2color: { [key: string]: TonThemeColor } = {
    negative: 'accentNegative',
    positive: 'accentPositive',
    unknown: 'textSecondary'
  };

  return (
    <Screen>
      <Screen.Header 
        backButton={false} 
        title={t('wallet.screen_title')}
        rightContent={<ScanQRButton />}
      />

      <Screen.ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={isRefreshing && isFocused}
            tintColor={theme.colors.foregroundPrimary}
          />
        }
      >
        <View style={styles.mainSection}>
          <View style={styles.amount}>
            <Text variant="num2">
              {balance.fiatValue}
            </Text>
            {wallet && (
              <TouchableOpacity 
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
        
        {wallet ? (
          <List>
            <List.Item
              onPress={() => openWallet(CryptoCurrencies.Ton)}
              title="Toncoin"
              subtitle={
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    color="textSecondary"
                    style={{ marginRight: 6 }}
                    variant="body2"
                  >
                    {balance.fiatPrice}
                  </Text>
                  <Text
                    color={trend2color[balance.trend]}
                    variant="body2" 
                  >
                    {balance.percent}
                  </Text>
                </View>
              }
              
              value={balance.formatedAmount}
              subvalue={balance.fiatValue}
              leftContent={() => (
                <View style={styles.tokenIcon}>
                  <Image 
                    style={{ width: 44, height: 44 }}
                    source={require('$assets/currency/ic-ton-48.png')} 
                  />
                </View>
              )}
            />
            
            {tokens.map((item) => (
              <List.Item 
                onPress={() => openJetton(item.address.rawAddress)}
                leftContent={() => (
                  <View style={styles.tokenIcon}>
                    <Image 
                      style={{ width: 44, height: 44 }}
                      source={{ uri: item.iconUrl }} 
                    />
                  </View>
                )}
                title={item.name}
                value={item.quantity}
                // subtitle={item.price}
                // subvalue={}
                // label={item.symbol}
              />
            ))}
          </List>
        ) : null}

        <View style={styles.nftElements}>
          {nfts.map((item, key) => (
            <NFTCardItem
              item={item}
              key={key}
            />
          ))}
         </View>
      </Screen.ScrollView>
    </Screen>
  );
});

const styles = Steezy.create(({ colors }) => ({
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
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    overflow: 'hidden',
    backgroundColor: colors.backgroundContentTint
  },
  buttons: {
    
  },
  nftElements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12
  }
}));
