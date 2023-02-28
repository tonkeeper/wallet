import React, { memo, useMemo } from 'react';
import { t } from '$translation';
import { Icon, IconButton, IconButtonList, Screen, Text, TouchableHighlight, TouchableOpacity, View } from '$uikit';
import { List } from '$uikit/List/new';
import { Steezy } from '$styles';
import { useNavigation } from '$libs/navigation';
import { ScanQRButton } from '../../components/ScanQRButton';
import { Image } from 'react-native';
import { useJettonBalances, useWalletInfo } from '$hooks';
import TonWeb from 'tonweb';
import { NFTCardItem } from './NFTCardItem';
import { useNFT } from '$hooks/useNFT';
import { useSelector } from 'react-redux';
import { nftsSelector } from '$store/nfts';
import { store } from '$store';
import { openJetton, openScanQR, openSend, openWallet } from '$navigation';
import { isValidAddress } from '$utils';
import { CryptoCurrencies, Decimals, FiatCurrencies } from '$shared/constants';
import { formatCryptoCurrency, formatFiatCurrencyAmount } from '$utils/currency';
import { ratesChartsSelector, ratesRatesSelector } from '$store/rates';
import { fiatCurrencySelector } from '$store/main';
import { getRate } from '$hooks/useFiatRate';

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

  const t: TokenInfo[] = jettonBalances.map((item) => {

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
  });

  // console.log(t);

  
  
  return t
}

const useNFTs = () => {
  const { myNfts } = useSelector(nftsSelector);
  

  const nfts = Object.values(myNfts).map((item) => {
    

    return item;
  });

  // console.log(nfts);

  return nfts;
};

const useWallet = () => {
  return { 
    address: 'EQD2...G21n',
  }
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
    fiatPrice,
    formatedAmount,
    amount,
    percent: fiatInfo.percent,
    
  };
}

export const WalletScreen = memo((props) => {
  const nav = useNavigation();
  const tokens = useTonkens();
  const nfts = useNFTs();
  const wallet = useWallet();

  const balance = useBalance();

  const isShowTabs = false;
  
  const handlePressSell = () => nav.openModal('Exchange', { category: 'sell' });
  const handlePressBuy = () => nav.openModal('Exchange', { category: 'buy' });
  const handlePressSend = () => nav.go('Send', {});
  const handlePressRecevie = () => nav.go('Receive', { 
    currency: 'ton',
    isFromMainScreen: true
  });

  return (
    <Screen>
      <Screen.Header 
        backButton={false} 
        title={t('wallet.screen_title')}
        rightContent={<ScanQRButton />}
      />

      <Screen.ScrollView>
        <View style={styles.mainSection}>
          <View style={styles.amount}>
            <Text variant="num2">
              {balance.fiatValue}
            </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text
                color="textSecondary"
                variant="body2"
                style={styles.addressText.static} 
              >
                {wallet.address}
              </Text>
            </TouchableOpacity>
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
              subtitle={balance.fiatPrice}
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
                // subvalue={'$23'}
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
    paddingTop: 28,
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
