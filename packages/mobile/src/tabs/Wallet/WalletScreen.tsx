import { Button, IconButton, IconButtonList, InternalNotification, Screen, Text, View, PagerView } from '$uikit';
import { useInternalNotifications } from './hooks/useInternalNotifications';
import { openRequireWalletModal, openWallet } from '$navigation';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useBalance, useRates } from './hooks/useBalance';
import { ListItemRate } from './components/ListItemRate';
import { BalancesList } from './components/BalancesList';
import { useDispatch, useSelector } from 'react-redux';
import { memo, useCallback, useEffect } from 'react';
import { CryptoCurrencies } from '$shared/constants';
import { ScanQRButton, TonIcon } from '$components';
import { useNavigation } from '$libs/navigation';
import { useTonkens } from './hooks/useTokens';
import { walletSelector } from '$store/wallet';
import { useWallet } from './hooks/useWallet';
import { copyText } from '$hooks/useCopyText';
import { mainActions } from '$store/main';
import { useNFTs } from './hooks/useNFTs';
import { maskifyAddress } from '$utils';
import { List } from '$uikit/List/new';
import { Steezy } from '$styles';
import { t } from '$translation';

export const WalletScreen = memo(() => {
  const { isLoaded } = useSelector(walletSelector);
  const wallet = useWallet();
  const tokens = useTonkens();
  const nfts = useNFTs();

  const balance = useBalance(tokens.total.fiat);
  const rates = useRates();

  const notifications = useInternalNotifications();
  const nav = useNavigation();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(mainActions.mainStackInited());
  }, []);

  const handlePressSell = useCallback(() => {
    if (wallet) {
      nav.openModal('Exchange', { category: 'sell' });
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);

  const handlePressBuy = useCallback(() => {
    if (wallet) {
      nav.openModal('Exchange', { category: 'buy' });
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);

  const handlePressSend = useCallback(() => {
    if (wallet) {
      nav.go('Send', {});
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);

  const handlePressRecevie = useCallback(() => {
    if (wallet) {
      nav.go('Receive', {
        currency: 'ton',
        isFromMainScreen: true,
      });
    } else {
      openRequireWalletModal();
    }
  }, [wallet]);

  const isPagerView = tokens.list.length > 2 && tokens.list.length + nfts.length + 1 > 10;

  const balancesHeader = (
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
        <View style={styles.walletSpace} />
        {wallet && (
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 18, right: 18 }}
            onPress={() => copyText(wallet.address.friendlyAddress)}
            activeOpacity={0.6}
          >
            <Text color="textSecondary" variant="body2">
              {maskifyAddress(wallet.address.friendlyAddress)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <IconButtonList>
        <IconButton
          title={t('wallet.buy_btn')}
          onPress={handlePressBuy}
          iconName="ic-plus-28"
        />
        <IconButton
          title={t('wallet.send_btn')}
          onPress={handlePressSend}
          iconName="ic-arrow-up-28"
        />
        <IconButton
          title={t('wallet.receive_btn')}
          onPress={handlePressRecevie}
          iconName="ic-arrow-down-28"
        />
        <IconButton
          title={t('wallet.sell_btn')}
          onPress={handlePressSell}
          iconName="ic-minus-28"
        />
      </IconButtonList>
    </View>
  );

  if (!wallet) {
    return (
      <Screen>
        <Screen.Header
          title={t('wallet.screen_title')}
          rightContent={<ScanQRButton />}
          hideBackButton
        />
        <Screen.ScrollView indent={false}>
          {balancesHeader}
          <List>
            <List.Item
              title="Toncoin"
              onPress={() => openWallet(CryptoCurrencies.Ton)}
              leftContent={<TonIcon />}
              chevron
              subtitle={
                <ListItemRate
                  price={rates.price}
                  trend={rates.trend}
                />
              }
            />
          </List>
        </Screen.ScrollView>
        {isLoaded && (
          <Button onPress={() => openRequireWalletModal()}>
            {t('balances_setup_wallet')}
          </Button>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <Screen.Header
        title={t('wallet.screen_title')}
        rightContent={<ScanQRButton />}
        hideBackButton
      />
      {isPagerView ? (
        <PagerView tabBarStyle={styles.tabBar.static}>
          <PagerView.Header>{balancesHeader}</PagerView.Header>
          <PagerView.Page tabLabel={t('wallet.tonkens_tab_lable')}>
            <BalancesList
              ListComponent={PagerView.FlashList}
              balance={balance}
              tokens={tokens}
              rates={rates}
            />
          </PagerView.Page>
          <PagerView.Page tabLabel={t('wallet.collectibles_tab_lable')}>
            <BalancesList
              ListComponent={PagerView.FlashList}
              nfts={nfts}
            />
          </PagerView.Page>
        </PagerView>
      ) : (
        <BalancesList
          ListHeaderComponent={balancesHeader}
          ListComponent={Screen.FlashList}
          balance={balance}
          tokens={tokens}
          rates={rates}
          nfts={nfts}
        />
      )}
    </Screen>
  );
});

const styles = Steezy.create({
  mainSection: {
    paddingBottom: 24,
  },
  amount: {
    paddingTop: 28,
    alignItems: 'center',
    marginBottom: 24.5,
  },
  addressText: {
    marginTop: 7.5,
  },
  scrollContainer: {
    paddingHorizontal: 12,
  },
  walletSpace: {
    marginTop: 7.5,
  },
  tabBar: {
    alignItems: 'center',
  },
});
