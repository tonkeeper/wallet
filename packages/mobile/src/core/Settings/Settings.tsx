import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Rate, { AndroidMarket } from 'react-native-rate';
import { Alert, Linking, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';

import * as S from './Settings.style';
import { Icon, PopupSelect, ScrollHandler, Spacer, Text } from '$uikit';
import { Icon as NewIcon } from '@tonkeeper/uikit';
import { useShouldShowTokensButton } from '$hooks/useShouldShowTokensButton';
import { useNavigation } from '@tonkeeper/router';
import { alwaysShowV4R1Selector } from '$store/main';
import { List } from '@tonkeeper/uikit';
import {
  AppStackRouteNames,
  MainStackRouteNames,
  openDeleteAccountDone,
  openDevMenu,
  openLegalDocuments,
  openManageTokens,
  openNotifications,
  openRefillBattery,
  openSecurity,
  openSubscriptions,
} from '$navigation';
import { walletActions } from '$store/wallet';
import {
  APPLE_STORE_ID,
  GOOGLE_PACKAGE_NAME,
  LargeNavBarHeight,
  IsTablet,
} from '$shared/constants';
import { checkIsTonDiamondsNFT, hNs, ns, throttle } from '$utils';
import { LargeNavBarInteractiveDistance } from '$uikit/LargeNavBar/LargeNavBar';
import { CellSectionItem } from '$shared/components';
import { useNotifications } from '$hooks/useNotifications';
import { useNotificationsBadge } from '$hooks/useNotificationsBadge';
import { useFlags } from '$utils/flags';
import { SearchEngine, useBrowserStore, useNotificationsStore } from '$store';
import AnimatedLottieView from 'lottie-react-native';
import { Steezy } from '$styles';
import { t } from '@tonkeeper/shared/i18n';
import { trackEvent } from '$utils/stats';
import { openAppearance } from '$core/ModalContainer/AppearanceModal';
import { config } from '$config';
import { shouldShowNotifications } from '$store/zustand/notifications/selectors';
import {
  useBalancesState,
  useNftsState,
  useWallet,
  useWalletCurrency,
  useWallets,
} from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { WalletContractVersion } from '$wallet/WalletTypes';
import { mapNewNftToOldNftData } from '$utils/mapNewNftToOldNftData';
import { WalletListItem } from '@tonkeeper/shared/components';
import { useSubscriptions } from '@tonkeeper/shared/hooks/useSubscriptions';

export const Settings: FC = () => {
  const animationRef = useRef<AnimatedLottieView>(null);
  const devMenuHandlerRef = useRef(null);

  const flags = useFlags([
    'disable_apperance',
    'disable_support_button',
    'disable_feedback_button',
    'address_style_settings',
    'address_style_nobounce',
  ]);

  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const notificationsBadge = useNotificationsBadge();
  const notifications = useNotifications();

  const fiatCurrency = useWalletCurrency();
  const dispatch = useDispatch();
  const hasSubscriptions = useSubscriptions(
    (state) => Object.values(state.subscriptions).length > 0,
  );
  const wallet = useWallet();
  const balances = useBalancesState();
  const alwaysShowV4R1 = useSelector(alwaysShowV4R1Selector);
  const showV4R1 =
    alwaysShowV4R1 ||
    balances.tonOldBalances.some(
      (oldBalance) => oldBalance.version === 'v4R1' && oldBalance.balance,
    );
  const shouldShowTokensButton = useShouldShowTokensButton();
  const showNotifications = useNotificationsStore(shouldShowNotifications);

  const isBatteryVisible = !!wallet && !config.get('disable_battery');

  const searchEngine = useBrowserStore((state) => state.searchEngine);
  const setSearchEngine = useBrowserStore((state) => state.actions.setSearchEngine);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAnimateDiamond = useCallback(
    throttle(() => {
      animationRef?.current?.play();
    }, 500),
    [],
  );

  const handleRateApp = useCallback(() => {
    const options = {
      preferInApp: false,
      AppleAppID: APPLE_STORE_ID,
      GooglePackageName: GOOGLE_PACKAGE_NAME,
      preferredAndroidMarket: AndroidMarket.Google,
    };

    Rate.rate(options, (_) => {
      //
    });
  }, []);

  const handleFeedback = useCallback(() => {
    Linking.openURL(config.get('supportLink')).catch((err) => console.log(err));
  }, []);

  const handleLegal = useCallback(() => {
    openLegalDocuments();
  }, []);

  const handleNews = useCallback(() => {
    Linking.openURL(config.get('tonkeeperNewsUrl')).catch((err) => console.log(err));
  }, []);

  const handleSupport = useCallback(() => {
    Linking.openURL(config.get('directSupportUrl')).catch((err) => console.log(err));
  }, []);

  const handleResetWallet = useCallback(() => {
    Alert.alert(t('settings_reset_alert_title'), t('settings_reset_alert_caption'), [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('settings_reset_alert_button'),
        style: 'destructive',
        onPress: () => {
          if (showNotifications) {
            notifications.unsubscribe();
          }
          dispatch(walletActions.cleanWallet());
        },
      },
    ]);
  }, [dispatch, notifications, showNotifications]);

  const handleStopWatchWallet = useCallback(() => {
    if (showNotifications) {
      notifications.unsubscribe();
    }
    dispatch(walletActions.cleanWallet());
  }, [dispatch, notifications, showNotifications]);

  const handleSubscriptions = useCallback(() => {
    openSubscriptions();
  }, []);

  const handleNotifications = useCallback(() => {
    openNotifications();
  }, []);

  const versions = useMemo(() => {
    return Object.values(WalletContractVersion)
      .reverse()
      .filter((key) => {
        if (key === WalletContractVersion.v4R1) {
          return showV4R1;
        }
        if (key === WalletContractVersion.LockupV1) {
          return false;
        }
        return true;
      });
  }, [showV4R1]);

  const searchEngineVariants = Object.values(SearchEngine);

  const handleChangeVersion = useCallback((version: WalletContractVersion) => {
    tk.updateWallet({ version });
  }, []);

  const handleSwitchLanguage = useCallback(() => {
    Alert.alert(t('language.language_alert.title'), undefined, [
      {
        text: t('language.language_alert.cancel'),
        style: 'cancel',
      },
      {
        text: t('language.language_alert.open'),
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]);
  }, []);

  const handleDevMenu = useCallback(() => {
    openDevMenu();
  }, []);

  const handleSecurity = useCallback(() => {
    openSecurity();
  }, []);

  const handleBackupSettings = useCallback(() => {
    dispatch(walletActions.backupWallet());
  }, [dispatch]);

  const handleAppearance = useCallback(() => {
    openAppearance();
  }, []);

  const handleManageTokens = useCallback(() => {
    openManageTokens();
  }, []);

  const handleBattery = useCallback(() => {
    openRefillBattery();
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(t('settings_delete_alert_title'), t('settings_delete_alert_caption'), [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('settings_delete_alert_button'),
        style: 'destructive',
        onPress: () => {
          trackEvent('delete_wallet');
          notifications.unsubscribe();
          openDeleteAccountDone();
        },
      },
    ]);
  }, [notifications]);

  const handleCustomizePress = useCallback(
    () => nav.navigate(AppStackRouteNames.CustomizeWallet),
    [nav],
  );

  const notificationIndicator = React.useMemo(() => {
    if (notificationsBadge.isVisible) {
      return (
        <View style={styles.notificationIndicatorContainer.static}>
          <S.NotificationDeniedIndicator />
        </View>
      );
    }

    return null;
  }, [notificationsBadge.isVisible]);

  const accountNfts = useNftsState((s) => s.accountNfts);

  const hasDiamods = useMemo(() => {
    if (!wallet || wallet.isWatchOnly) {
      return false;
    }

    return Object.values(accountNfts).find((nft) =>
      checkIsTonDiamondsNFT(mapNewNftToOldNftData(nft, wallet.address.ton.friendly)),
    );
  }, [wallet, accountNfts]);

  const isAppearanceVisible = React.useMemo(() => {
    return hasDiamods && !flags.disable_apperance;
  }, [hasDiamods, flags.disable_apperance]);

  const wallets = useWallets();

  return (
    <S.Wrap>
      <ScrollHandler navBarTitle={t('settings_title')}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: IsTablet ? ns(8) : hNs(LargeNavBarHeight),
            paddingBottom: tabBarHeight,
            alignItems: IsTablet ? 'center' : undefined,
          }}
          scrollEventThrottle={16}
        >
          {wallet ? (
            <>
              <List>
                <WalletListItem
                  onPress={handleCustomizePress}
                  wallet={wallet}
                  subtitle={t('customize')}
                  rightContent={<Icon name="ic-chevron-right-16" />}
                />
              </List>
              <Spacer y={16} />
            </>
          ) : null}
          <List>
            {!!wallet && tk.walletForUnlock && (
              <List.Item
                value={
                  <Icon
                    style={styles.icon.static}
                    color="accentPrimary"
                    name={'ic-key-28'}
                  />
                }
                title={t('settings_backup_seed')}
                onPress={handleBackupSettings}
              />
            )}
            {shouldShowTokensButton && (
              <List.Item
                value={
                  <Icon
                    style={styles.icon.static}
                    color="accentPrimary"
                    name={'ic-jetton-28'}
                  />
                }
                title={t('settings_jettons_list')}
                onPress={handleManageTokens}
              />
            )}
            {hasSubscriptions && (
              <List.Item
                value={
                  <Icon
                    style={styles.icon.static}
                    color="accentPrimary"
                    name={'ic-ticket-28'}
                  />
                }
                title={t('settings_subscriptions')}
                onPress={handleSubscriptions}
              />
            )}
            {!!wallet && showNotifications && (
              <List.Item
                value={<Icon color="accentPrimary" name={'ic-notification-28'} />}
                title={
                  <View style={styles.notificationsTextContainer.static}>
                    <Text variant="label1" numberOfLines={1} ellipsizeMode="tail">
                      {t('settings_notifications')}
                    </Text>
                    {notificationIndicator}
                  </View>
                }
                onPress={handleNotifications}
              />
            )}
            {isAppearanceVisible && (
              <List.Item
                value={
                  <Icon
                    style={styles.icon.static}
                    color="accentPrimary"
                    name={'ic-appearance-28'}
                  />
                }
                title={t('settings_appearance')}
                onPress={handleAppearance}
              />
            )}
            <List.Item
              value={
                <S.SelectedCurrency>{fiatCurrency.toUpperCase()}</S.SelectedCurrency>
              }
              title={t('settings_primary_currency')}
              onPress={() => nav.navigate('ChooseCurrency')}
            />

            {!!wallet && (
              <PopupSelect
                items={versions}
                selected={wallet.config.version}
                onChange={handleChangeVersion}
                keyExtractor={(item) => item}
                width={220}
                renderItem={(version) => (
                  <S.WalletVersion>
                    <Text variant="label1" style={{ marginRight: ns(8) }}>
                      {version}
                    </Text>
                    <Text variant="body1" color="foregroundSecondary">
                      {
                        wallet.tonAllAddresses[
                          version as Exclude<
                            WalletContractVersion,
                            WalletContractVersion.LockupV1
                          >
                        ].short
                      }
                    </Text>
                  </S.WalletVersion>
                )}
              >
                <List.Item
                  value={
                    <Text variant="label1" color="accentPrimary">
                      {wallet.config.version}
                    </Text>
                  }
                  title={t('settings_wallet_version')}
                />
              </PopupSelect>
            )}
            {isBatteryVisible && (
              <List.Item
                value={
                  <NewIcon
                    style={styles.icon.static}
                    color="accentBlue"
                    name={'ic-battery-28'}
                  />
                }
                title={t('battery.settings')}
                onPress={handleBattery}
              />
            )}
          </List>
          <Spacer y={16} />
          <List>
            {!!wallet && tk.walletForUnlock && (
              <List.Item
                value={
                  <Icon
                    style={styles.icon.static}
                    color="accentPrimary"
                    name="ic-lock-28"
                  />
                }
                title={t('settings_security')}
                onPress={handleSecurity}
              />
            )}
            <PopupSelect
              items={searchEngineVariants}
              selected={searchEngine}
              onChange={setSearchEngine}
              keyExtractor={(item) => item}
              width={176}
              renderItem={(item) => <Text variant="label1">{item}</Text>}
            >
              <List.Item
                value={
                  <Text variant="label1" color="accentPrimary">
                    {searchEngine}
                  </Text>
                }
                title={t('settings_search_engine')}
              />
            </PopupSelect>
            <List.Item
              onPress={handleSwitchLanguage}
              value={
                <Text variant="label1" color="accentPrimary">
                  {t('language.list_item.value')}
                </Text>
              }
              title={t('language.list_item.title')}
            />
            {wallet && !wallet.isWatchOnly && flags.address_style_settings ? (
              <List.Item
                value={
                  <Text variant="label1" color="accentPrimary">
                    EQ » UQ
                  </Text>
                }
                title={t('address_update.title')}
                onPress={() => nav.navigate(MainStackRouteNames.AddressUpdateInfo)}
              />
            ) : null}
          </List>
          <Spacer y={16} />
          <List>
            {!flags.disable_support_button ? (
              <List.Item
                onPress={handleSupport}
                value={
                  <Icon
                    style={styles.icon.static}
                    color="accentPrimary"
                    name={'ic-message-bubble-28'}
                  />
                }
                title={t('settings_support')}
              />
            ) : null}
            <List.Item
              onPress={handleNews}
              value={
                <Icon
                  style={styles.icon.static}
                  color="iconSecondary"
                  name={'ic-telegram-28'}
                />
              }
              title={t('settings_news')}
            />
            {!flags.disable_feedback_button ? (
              <List.Item
                onPress={handleFeedback}
                value={
                  <Icon
                    style={styles.icon.static}
                    color="iconSecondary"
                    name={'ic-envelope-28'}
                  />
                }
                title={t('settings_contact_support')}
              />
            ) : null}
            <List.Item
              onPress={handleRateApp}
              value={
                <Icon
                  style={styles.icon.static}
                  color="iconSecondary"
                  name={'ic-star-28'}
                />
              }
              title={t('settings_rate')}
            />
            {!!wallet && !wallet.isWatchOnly && (
              <List.Item
                onPress={handleDeleteAccount}
                value={
                  <Icon
                    style={styles.icon.static}
                    color="iconSecondary"
                    name={'ic-trash-bin-28'}
                  />
                }
                title={t('settings_delete_account')}
              />
            )}
            <List.Item
              onPress={handleLegal}
              value={
                <Icon
                  style={styles.icon.static}
                  color="iconSecondary"
                  name={'ic-doc-28'}
                />
              }
              title={t('settings_legal_documents')}
            />
          </List>
          <Spacer y={16} />
          {!!wallet && (
            <>
              <List>
                {wallet.isWatchOnly ? (
                  <CellSectionItem onPress={handleStopWatchWallet} icon="ic-trash-bin-28">
                    {t('stop_watch')}
                  </CellSectionItem>
                ) : (
                  <CellSectionItem onPress={handleResetWallet} icon="ic-door-28">
                    {t('settings_reset')}
                  </CellSectionItem>
                )}
              </List>
              <Spacer y={16} />
            </>
          )}
          <S.Content>
            <TapGestureHandler
              simultaneousHandlers={devMenuHandlerRef}
              onHandlerStateChange={handleAnimateDiamond}
            >
              <TapGestureHandler
                ref={devMenuHandlerRef}
                numberOfTaps={5}
                onGestureEvent={() => console.log(true)}
                onActivated={handleDevMenu}
              >
                <S.AppInfo>
                  <S.AppInfoIcon
                    ref={animationRef}
                    loop={false}
                    source={require('$assets/lottie/diamond.json')}
                  />

                  <S.AppInfoTitleWrapper>
                    <Text fontSize={14} lineHeight={20} fontWeight="700">
                      {DeviceInfo.getApplicationName()}
                    </Text>
                  </S.AppInfoTitleWrapper>
                  <S.AppInfoVersionWrapper>
                    <Text variant="label3" color="foregroundSecondary">
                      {t('settings_version')} {DeviceInfo.getVersion()}
                    </Text>
                  </S.AppInfoVersionWrapper>
                </S.AppInfo>
              </TapGestureHandler>
            </TapGestureHandler>
          </S.Content>
          <View style={{ height: LargeNavBarInteractiveDistance }} />
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};

const styles = Steezy.create({
  icon: {
    marginTop: -2,
    marginBottom: -2,
  },
  notificationsTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  notificationIndicatorContainer: {
    height: 24,
    paddingTop: 9.5,
    paddingBottom: 6.5,
    marginLeft: 8,
  },
});
