import { memo, useCallback, useEffect, useMemo } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Screen, Text, View, copyText, Haptics, Icon } from '@tonkeeper/uikit';
import { InternalNotification, Tag } from '$uikit';
import { useNavigation } from '@tonkeeper/router';
import { useDispatch } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { useBalance } from './hooks/useBalance';
import { TabletMaxWidth } from '$shared/constants';
import { useInternalNotifications } from './hooks/useInternalNotifications';
import { mainActions } from '$store/main';
import { Steezy } from '$styles';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { UpdatesCell } from '$core/ApprovalCell/Updates/UpdatesCell';
import { UpdateState } from '$store/zustand/updates/types';
import { ShowBalance } from '$core/HideableAmount/ShowBalance';
import { ExpiringDomainCell } from './components/ExpiringDomainCell';
import { useNetInfo } from '@react-native-community/netinfo';
import { format } from 'date-fns';
import { getLocale } from '$utils/date';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useWallet, useWalletStatus } from '@tonkeeper/shared/hooks';
import { WalletSelector } from './components/WalletSelector';
import { MainStackRouteNames } from '$navigation';
import { WalletActionButtons } from './components/WalletActionButtons/WalletActionButtons';
import { WalletContentList } from './components/WalletContentList';
import { usePreparedWalletContent } from './content-providers/utils/usePreparedWalletContent';
import { FinishSetupList } from './components/FinishSetupList';
import { BackupIndicator } from './components/Tabs/BackupIndicator';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';

export const WalletScreen = memo(({ navigation }) => {
  const dispatch = useDispatch();
  const nav = useNavigation();
  const wallet = useWallet();
  const shouldUpdate =
    useUpdatesStore((state) => state.update.state) !== UpdateState.NOT_STARTED;

  const preparedContent = usePreparedWalletContent();
  const balance = useBalance(preparedContent);

  const { isReloading: isRefreshing, updatedAt: walletUpdatedAt } = useWalletStatus();

  const isNotCoinReceived = useExternalState(
    wallet.activityList.state,
    (state) => state.isNotCoinReceived,
  );
  const notCoinActionId = useExternalState(
    wallet.activityList.state,
    (state) => state.notCoinActionId,
  );

  const isFocused = useIsFocused();
  const notifications = useInternalNotifications();

  const { isConnected } = useNetInfo();

  // TODO: rewrite
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(mainActions.mainStackInited());
      dispatch(mainActions.setUnlocked(true));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const handleNavigateToSettingsStack = () => nav.navigate(MainStackRouteNames.Settings);

  const handleRefresh = useCallback(() => {
    if (!wallet) {
      return;
    }

    wallet.reload();
  }, [wallet]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabLongPress', () => {
      Haptics.notificationSuccess();
      nav.openModal('/switch-wallet');
    });

    return unsubscribe;
  }, [nav, navigation]);

  const isWatchOnly = wallet && wallet.isWatchOnly;

  const ListHeader = useMemo(
    () => (
      <View style={styles.mainSection}>
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
          <ShowBalance
            isWatchOnly={isWatchOnly || wallet.isExternal}
            dangerLevel={balance.dangerLevel}
            amount={balance.inSelectedCurrency}
          />
          <View style={styles.addressContainer}>
            {wallet && isConnected !== false ? (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 18, right: 18 }}
                style={{ zIndex: 3 }}
                onPress={copyText(wallet.address.ton.friendly)}
                activeOpacity={0.6}
              >
                <Text color="textSecondary" type="body2">
                  {wallet.address.ton.short}
                </Text>
              </TouchableOpacity>
            ) : null}
            {wallet && isConnected === false && walletUpdatedAt ? (
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
            {wallet && wallet.isTestnet ? (
              <>
                <Tag type="warning">Testnet</Tag>
              </>
            ) : null}
            {isWatchOnly ? (
              <>
                <Tag type="warning">{t('watch_only')}</Tag>
              </>
            ) : null}
            {wallet && wallet.isSigner ? (
              <>
                <Tag type="purple">Signer</Tag>
              </>
            ) : null}
            {wallet && wallet.isLedger ? (
              <>
                <Tag type="positive">Ledger</Tag>
              </>
            ) : null}
          </View>
        </View>
        <WalletActionButtons />
        {wallet && !wallet.isWatchOnly && (
          <>
            <ExpiringDomainCell />
            {!wallet.isExternal ? <FinishSetupList /> : null}
          </>
        )}
      </View>
    ),
    [
      balance,
      isConnected,
      isWatchOnly,
      notifications,
      shouldUpdate,
      wallet,
      walletUpdatedAt,
    ],
  );

  if (!wallet) {
    return null;
  }

  return (
    <Screen>
      <Screen.Header
        title={<WalletSelector />}
        rightContent={
          <TouchableOpacity
            style={styles.gearContainer.static}
            activeOpacity={0.6}
            onPress={handleNavigateToSettingsStack}
          >
            {!isWatchOnly && !wallet.isExternal ? <BackupIndicator /> : null}
            <Icon color="iconSecondary" name={'ic-gear-outline-28'} />
          </TouchableOpacity>
        }
        hideBackButton
      />
      <WalletContentList
        walletContent={preparedContent}
        ListHeaderComponent={ListHeader}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        isFocused={isFocused}
        identifier={wallet.identifier}
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
  addressContainer: {
    marginBottom: 8,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gearContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
