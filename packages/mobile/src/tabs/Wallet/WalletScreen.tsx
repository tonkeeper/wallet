import { memo, useCallback, useEffect, useMemo } from 'react';
import { i18n, t } from '@tonkeeper/shared/i18n';
import { InternalNotification } from '$uikit';
import { useNavigation } from '@tonkeeper/router';
import { ScanQRButton } from '../../components/ScanQRButton';
import { RefreshControl, useWindowDimensions } from 'react-native';
import { NFTCardItem } from './NFTCardItem';
import { useDispatch, useSelector } from 'react-redux';
import { ns } from '$utils';
import { walletActions, walletSelector, walletUpdatedAtSelector } from '$store/wallet';
import { copyText } from '$hooks/useCopyText';
import { useIsFocused } from '@react-navigation/native';
import { useBalance } from './hooks/useBalance';
import { CryptoCurrencies, TabletMaxWidth } from '$shared/constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useInternalNotifications } from './hooks/useInternalNotifications';
import { mainActions } from '$store/main';
import { useTonkens } from './hooks/useTokens';
import { useApprovedNfts } from '$hooks/useApprovedNfts';
import { useTheme } from '$hooks/useTheme';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { Steezy } from '$styles';
import { WalletContentList } from './components/WalletContentList';
import { useFlags } from '$utils/flags';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { UpdatesCell } from '$core/ApprovalCell/Updates/UpdatesCell';
import { UpdateState } from '$store/zustand/updates/types';
import { ShowBalance } from '$core/HideableAmount/ShowBalance';
import { Events, SendAnalyticsFrom } from '$store/models';
import { trackEvent } from '$utils/stats';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { ExpiringDomainCell } from './components/ExpiringDomainCell';
import { useNewWallet } from '@tonkeeper/shared/hooks/useWallet';
import { Address } from '@tonkeeper/shared/Address';
import { useJettons } from '@tonkeeper/shared/hooks/useJettons';
import {
  IconButton,
  IconButtonList,
  Screen,
  Text,
  View,
  PagerView,
} from '@tonkeeper/uikit';
import { useCurrency } from '@tonkeeper/shared/hooks/useCurrency';
import { useTonBalance } from '@tonkeeper/shared/hooks/useTonBalance';
import { formatter } from '$utils/formatter';
import BigNumber from 'bignumber.js';
import { UpdatingStatus } from '@tonkeeper/shared/components/UpdatingStatus';

const useTotalBalance = () => {
  const jettonBalances = useJettons((state) => state.items);
  const tonBalance = useTonBalance();
  const currency = useCurrency();

  const total = useMemo(() => {
    const jettonAmounts = jettonBalances.reduce<string[]>((acc, item) => {
      if (item.price) {
        acc.push(new BigNumber(item.balance).multipliedBy(item.price.value).toString());
      }

      return acc;
    }, []);

    const balances = [tonBalance, ...jettonAmounts];

    return balances
      .reduce((total, balance) => {
        return total.plus(balance);
      }, new BigNumber(0))
      .toString(10);
  }, [tonBalance, jettonBalances]);

  return formatter.formatNano(total, { currency });
};
import { useNetInfo } from '@react-native-community/netinfo';
import { format } from 'date-fns';
import { getLocale } from '$utils/date';

export const WalletScreen = memo(() => {
  const flags = useFlags(['disable_swap']);
  const dispatch = useDispatch();
  const theme = useTheme();
  const nav = useNavigation();

  // const { enabled: nfts } = useApprovedNfts();
  const wallet = useNewWallet();
  const shouldUpdate =
    useUpdatesStore((state) => state.update.state) !== UpdateState.NOT_STARTED;

  const { isRefreshing } = useSelector(walletSelector);

  const notifications = useInternalNotifications();
  const jettons = useJettons();

  const totalBalance = useTotalBalance();

  const { isConnected } = useNetInfo();

  const walletUpdatedAt = useSelector(walletUpdatedAtSelector);

  // TODO: rewrite
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(mainActions.mainStackInited());
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const handlePressSwap = useCallback(() => {
    nav.openModal('Swap');
  }, [nav]);

  const handlePressBuy = useCallback(() => {
    nav.openModal('Exchange');
  }, [nav]);

  const handlePressSend = useCallback(() => {
    trackEvent(Events.SendOpen, { from: SendAnalyticsFrom.WalletScreen });
    nav.go('Send', { from: SendAnalyticsFrom.WalletScreen });
  }, [nav]);

  const handlePressRecevie = useCallback(() => {
    nav.go('ReceiveModal');
  }, [nav]);

  const handleRefresh = useCallback(() => {
    dispatch(walletActions.refreshBalancesPage(true));
  }, [dispatch]);

  const ListHeader = useMemo(
    () => (
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
          <ShowBalance amount={totalBalance} />
          {wallet && tk.wallet && isConnected !== false ? (
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 18, right: 18 }}
              style={{ zIndex: 3, marginVertical: 8 }}
              onPress={() => copyText(wallet.ton.address.friendly)}
              activeOpacity={0.6}
            >
              <Text color="textSecondary" type="body2">
                {Address.toShort(wallet.ton.address.friendly)}
              </Text>
            </TouchableOpacity>
          ) : null}
          {wallet && tk.wallet && isConnected === false && walletUpdatedAt ? (
            <View style={{ zIndex: 3, marginVertical: 8 }}>
              <Text color="textSecondary" type="body2">
                {t('wallet.updated_at', {
                  value: format(walletUpdatedAt, 'd MMM, HH:mm', {
                    locale: getLocale(),
                  }).replace('.', ''),
                })}
              </Text>
            </View>
          ) : null}
        </View>
        <IconButtonList
          horizontalIndent={i18n.locale === 'ru' ? 'large' : 'small'}
          style={styles.actionButtons}
        >
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
              iconName="ic-swap-horizontal-28"
              title={t('wallet.swap_btn')}
            />
          )}
        </IconButtonList>
        {wallet && (
          <>
            <ExpiringDomainCell />
          </>
        )}
      </View>
    ),
    [
      flags.disable_swap,
      handlePressBuy,
      handlePressRecevie,
      handlePressSend,
      handlePressSwap,
      notifications,
      shouldUpdate,
      totalBalance,
      wallet,
    ],
  );

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

  const isPagerView = false;
  // nfts.length && jettons.items.length >= 2 && jettons.items.length + nfts.length + 1 > 10;

  return (
    <Screen>
      <Screen.Header
        title={t('wallet.screen_title')}
        bottomContent={<UpdatingStatus />}
        rightContent={<ScanQRButton />}
        hideBackButton
      />

      <WalletContentList
        ListHeaderComponent={ListHeader}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        jettons={jettons.items}
      />
    </Screen>
  );
});

const styles = Steezy.create(({ isTablet }) => ({
  container: {
    position: 'relative',
  },
  mainSection: {
    paddingHorizontal: 16,
  },
  amount: {
    paddingTop: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    marginBottom: 24,
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
