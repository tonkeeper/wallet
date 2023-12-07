import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Rate, { AndroidMarket } from 'react-native-rate';
import { Alert, Linking, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';

import * as S from './Settings.style';
import { List, Text, Spacer } from '@tonkeeper/uikit';
import { Icon, PopupSelect, ScrollHandler } from '$uikit';
import { useShouldShowTokensButton } from '$hooks/useShouldShowTokensButton';
import { useNavigation } from '@tonkeeper/router';
import { fiatCurrencySelector, showV4R1Selector } from '$store/main';
import { hasSubscriptionsSelector } from '$store/subscriptions';
import {
  MainStackRouteNames,
  openDeleteAccountDone,
  openDevMenu,
  openLegalDocuments,
  openManageTokens,
  openNotifications,
  openSecurity,
  openSecurityMigration,
  openSubscriptions,
} from '$navigation';
import {
  walletActions,
  walletVersionSelector,
  walletWalletSelector,
} from '$store/wallet';
import {
  APPLE_STORE_ID,
  getServerConfig,
  GOOGLE_PACKAGE_NAME,
  LargeNavBarHeight,
  SelectableVersion,
  SelectableVersionsConfig,
  IsTablet,
  SelectableVersions,
} from '$shared/constants';
import { hNs, ns, throttle, useHasDiamondsOnBalance } from '$utils';
import { LargeNavBarInteractiveDistance } from '$uikit/LargeNavBar/LargeNavBar';
import { CellSectionItem } from '$shared/components';
import { MainDB } from '$database';
import { useNotifications } from '$hooks/useNotifications';
import { useNotificationsBadge } from '$hooks/useNotificationsBadge';
import { useAllAddresses } from '$hooks/useAllAddresses';
import { useFlags } from '$utils/flags';
import { SearchEngine, useBrowserStore, useNotificationsStore } from '$store';
import AnimatedLottieView from 'lottie-react-native';
import { Steezy } from '$styles';
import { t } from '@tonkeeper/shared/i18n';
import { trackEvent } from '$utils/stats';
import { openAppearance } from '$core/ModalContainer/AppearanceModal';
import { Address } from '@tonkeeper/core';
import { shouldShowNotifications } from '$store/zustand/notifications/selectors';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { useNewWallet } from '@tonkeeper/shared/hooks/useNewWallet';

export const Settings: FC = () => {
  const newWallet = useNewWallet();
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

  const fiatCurrency = useSelector(fiatCurrencySelector);
  const dispatch = useDispatch();
  const hasSubscriptions = useSelector(hasSubscriptionsSelector);
  const wallet = useSelector(walletWalletSelector);
  const version = useSelector(walletVersionSelector);
  const allTonAddesses = useAllAddresses();
  const showV4R1 = useSelector(showV4R1Selector);
  const shouldShowTokensButton = useShouldShowTokensButton();
  const showNotifications = useNotificationsStore(shouldShowNotifications);

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
    Linking.openURL(getServerConfig('supportLink')).catch((err) => console.log(err));
  }, []);

  const handleLegal = useCallback(() => {
    openLegalDocuments();
  }, []);

  const handleNews = useCallback(() => {
    Linking.openURL(getServerConfig('tonkeeperNewsUrl')).catch((err) => console.log(err));
  }, []);

  const handleSupport = useCallback(() => {
    Linking.openURL(getServerConfig('directSupportUrl')).catch((err) => console.log(err));
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
        onPress: async () => {
          await tk.wallet.logout();
          dispatch(walletActions.cleanWallet());
          notifications.unsubscribe();
        },
      },
    ]);
  }, [dispatch, t]);

  const handleSubscriptions = useCallback(() => {
    openSubscriptions();
  }, []);

  const handleNotifications = useCallback(() => {
    openNotifications();
  }, []);

  const versions = useMemo(() => {
    return Object.keys(SelectableVersionsConfig).filter((key) => {
      if (key === SelectableVersions.V4R1) {
        return showV4R1;
      }
      return true;
    }) as SelectableVersion[];
  }, [showV4R1]);

  const searchEngineVariants = Object.values(SearchEngine);

  const handleChangeVersion = useCallback(
    (version: SelectableVersion) => {
      dispatch(walletActions.switchVersion(version));
    },
    [dispatch],
  );

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
    MainDB.isNewSecurityFlow().then((isNew) => {
      if (isNew) {
        openSecurity();
      } else {
        openSecurityMigration();
      }
    });
  }, []);

  const handleAppearance = useCallback(() => {
    openAppearance();
  }, []);

  const handleManageTokens = useCallback(() => {
    openManageTokens();
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
  }, []);

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

  const hasDiamods = useHasDiamondsOnBalance();
  const isAppearanceVisible = React.useMemo(() => {
    return hasDiamods && !flags.disable_apperance;
  }, [hasDiamods, flags.disable_apperance]);

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
          <List>
            <List.Item
              style={styles.listItem}
              title={
                <View style={styles.listIndicator.static}>
                  <Text type="label1">{t('backup_screen.title')}</Text>
                  {newWallet.lastBackupTimestamp === null && <List.Indicator />}
                </View>
              }
              navigate="/backup"
              rightContent={
                <Icon
                  style={styles.icon.static}
                  color="accentPrimary"
                  name={'ic-key-28'}
                />
              }
            />
            <List.Item
              style={styles.listItem}
              rightContent={
                <Icon
                  style={styles.icon.static}
                  color="accentPrimary"
                  name="ic-lock-28"
                />
              }
              title={t('settings_security')}
              onPress={handleSecurity}
            />
          </List>
          <Spacer y={16} />
          {(shouldShowTokensButton || hasSubscriptions || isAppearanceVisible) && (
            <>
              <List>
                {shouldShowTokensButton && (
                  <List.Item
                    style={styles.listItem}
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
                    style={styles.listItem}
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
                {isAppearanceVisible && (
                  <List.Item
                    style={styles.listItem}
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
              </List>
              <Spacer y={16} />
            </>
          )}
          <List>
            {!!wallet && showNotifications && (
              <List.Item
                style={styles.listItem}
                value={<Icon color="accentPrimary" name={'ic-notification-28'} />}
                title={
                  <View style={styles.notificationsTextContainer.static}>
                    <Text type="label1" numberOfLines={1} ellipsizeMode="tail">
                      {t('settings_notifications')}
                    </Text>
                    {notificationIndicator}
                  </View>
                }
                onPress={handleNotifications}
              />
            )}
            <List.Item
              style={styles.listItem}
              value={
                <S.SelectedCurrency>{fiatCurrency.toUpperCase()}</S.SelectedCurrency>
              }
              title={t('settings_primary_currency')}
              onPress={() => nav.navigate('ChooseCurrency')}
            />
            <PopupSelect
              items={searchEngineVariants}
              selected={searchEngine}
              onChange={setSearchEngine}
              keyExtractor={(item) => item}
              width={176}
              renderItem={(item) => <Text type="label1">{item}</Text>}
            >
              <List.Item
                style={styles.listItem}
                value={
                  <Text type="label1" color="accentBlue">
                    {searchEngine}
                  </Text>
                }
                title={t('settings_search_engine')}
              />
            </PopupSelect>
            <List.Item
              style={styles.listItem}
              onPress={handleSwitchLanguage}
              value={
                <Text type="label1" color="accentBlue">
                  {t('language.list_item.value')}
                </Text>
              }
              title={t('language.list_item.title')}
            />
            {!!wallet && (
              <PopupSelect
                items={versions}
                selected={version}
                onChange={handleChangeVersion}
                keyExtractor={(item) => item}
                width={220}
                renderItem={(version) => (
                  <S.WalletVersion>
                    <Text type="label1" style={{ marginRight: ns(8) }}>
                      {SelectableVersionsConfig[version]?.label}
                    </Text>
                    <Text type="body1" color="textSecondary">
                      {Address.parse(
                        allTonAddesses[SelectableVersionsConfig[version]?.label],
                        { bounceable: !flags.address_style_nobounce },
                      ).toShort()}
                    </Text>
                  </S.WalletVersion>
                )}
              >
                <List.Item
                  style={styles.listItem}
                  value={
                    <Text type="label1" color="accentBlue">
                      {SelectableVersionsConfig[version]?.label}
                    </Text>
                  }
                  title={t('settings_wallet_version')}
                />
              </PopupSelect>
            )}
            {wallet && flags.address_style_settings ? (
              <List.Item
                style={styles.listItem}
                value={
                  <Text type="label1" color="accentBlue">
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
                style={styles.listItem}
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
              style={styles.listItem}
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
                style={styles.listItem}
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
              style={styles.listItem}
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
            {!!wallet && (
              <List.Item
                style={styles.listItem}
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
              style={styles.listItem}
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
                <CellSectionItem onPress={handleResetWallet} icon="ic-door-28">
                  {t('settings_reset')}
                </CellSectionItem>
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
                    <Text type="label3" color="textSecondary">
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
  listIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    height: 56,
  },
});
