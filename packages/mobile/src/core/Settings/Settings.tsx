import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Rate, { AndroidMarket } from 'react-native-rate';
import { Alert, Linking, Platform, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { TapGestureHandler } from 'react-native-gesture-handler';

import * as S from './Settings.style';
import { Icon, PopupSelect, Spacer, Text } from '$uikit';
import { Icon as NewIcon, Screen } from '@tonkeeper/uikit';
import { useShouldShowTokensButton } from '$hooks/useShouldShowTokensButton';
import { useNavigation } from '@tonkeeper/router';
import { List } from '@tonkeeper/uikit';
import {
  AppStackRouteNames,
  MainStackRouteNames,
  SettingsStackRouteNames,
  openDevMenu,
  openLegalDocuments,
  openManageTokens,
  openNotifications,
  openSecurity,
  openSelectLanguage,
  openSubscriptions,
  openRefillBatteryModal,
} from '$navigation';
import { walletActions } from '$store/wallet';
import { APPLE_STORE_ID, GOOGLE_PACKAGE_NAME } from '$shared/constants';
import { checkIsTonDiamondsNFT, throttle } from '$utils';
import { CellSectionItem } from '$shared/components';
import { useFlags } from '$utils/flags';
import { SearchEngine, ThemeOptions, useAppThemeStore, useBrowserStore } from '$store';
import AnimatedLottieView from 'lottie-react-native';
import { Steezy } from '$styles';
import { i18n, t } from '@tonkeeper/shared/i18n';
import { openAppearance } from '$core/ModalContainer/AppearanceModal';
import { config } from '$config';
import {
  useNftsState,
  useWallet,
  useWalletCurrency,
  useWalletSetup,
} from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { mapNewNftToOldNftData } from '$utils/mapNewNftToOldNftData';
import { WalletListItem } from '@tonkeeper/shared/components';
import { useSubscriptions } from '@tonkeeper/shared/hooks/useSubscriptions';
import { nativeLocaleNames } from '@tonkeeper/shared/i18n/translations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Settings: FC = () => {
  const animationRef = useRef<AnimatedLottieView>(null);
  const devMenuHandlerRef = useRef(null);
  const { bottom: paddingBottom } = useSafeAreaInsets();

  const flags = useFlags([
    'disable_apperance',
    'disable_support_button',
    'disable_feedback_button',
    'address_style_settings',
    'address_style_nobounce',
  ]);

  const nav = useNavigation();

  const fiatCurrency = useWalletCurrency();
  const dispatch = useDispatch();
  const hasSubscriptions = useSubscriptions(
    (state) => Object.values(state.subscriptions).length > 0,
  );
  const wallet = useWallet();
  const shouldShowTokensButton = useShouldShowTokensButton();

  const { lastBackupAt } = useWalletSetup();

  const isBatteryVisible =
    !!wallet &&
    !wallet.isWatchOnly &&
    !wallet.isExternal &&
    !config.get('disable_battery');

  const searchEngine = useBrowserStore((state) => state.searchEngine);
  const setSearchEngine = useBrowserStore((state) => state.actions.setSearchEngine);

  const selectedTheme = useAppThemeStore((state) => state.selectedTheme);
  const setSelectedTheme = useAppThemeStore((state) => state.actions.setSelectedTheme);

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
    if (wallet.isExternal) {
      Alert.alert(t('settings_delete_signer_account'), undefined, [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('settings_delete_watch_account_button'),
          style: 'destructive',
          onPress: () => {
            dispatch(walletActions.cleanWallet());
          },
        },
      ]);
    } else {
      nav.navigate('/logout-warning');
    }
  }, [dispatch, nav, wallet.isExternal]);

  const handleStopWatchWallet = useCallback(() => {
    Alert.alert(t('settings_delete_watch_account'), undefined, [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('settings_delete_watch_account_button'),
        style: 'destructive',
        onPress: () => {
          dispatch(walletActions.cleanWallet());
        },
      },
    ]);
  }, [dispatch]);

  const handleSubscriptions = useCallback(() => {
    openSubscriptions();
  }, []);

  const handleNotifications = useCallback(() => {
    openNotifications();
  }, []);

  const searchEngineVariants = Object.values(SearchEngine);

  const themeVariants = Object.values(ThemeOptions);

  const handleSwitchLanguage = useCallback(() => {
    if (Platform.OS === 'android') {
      return openSelectLanguage();
    }

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
    nav.navigate(SettingsStackRouteNames.Backup);
  }, [nav]);

  const handleAppearance = useCallback(() => {
    openAppearance();
  }, []);

  const handleManageTokens = useCallback(() => {
    openManageTokens();
  }, []);

  const handleBattery = useCallback(() => {
    openRefillBatteryModal();
  }, []);

  const handleDeleteAccount = useCallback(() => {
    nav.openModal('/logout-warning', { isDelete: true });
  }, [nav]);

  const handleCustomizePress = useCallback(
    () => nav.navigate(AppStackRouteNames.CustomizeWallet),
    [nav],
  );

  const backupIndicator = React.useMemo(() => {
    if (lastBackupAt !== null) {
      return null;
    }

    return (
      <View style={styles.backupIndicatorContainer.static}>
        <S.BackupIndicator />
      </View>
    );
  }, [lastBackupAt]);

  const accountNfts = useNftsState((s) => s.accountNfts);

  const hasDiamods = useMemo(() => {
    if (!wallet || wallet?.isWatchOnly) {
      return false;
    }

    return Object.values(accountNfts).find((nft) =>
      checkIsTonDiamondsNFT(mapNewNftToOldNftData(nft, wallet.address.ton.friendly)),
    );
  }, [wallet, accountNfts]);

  const isAppearanceVisible = React.useMemo(() => {
    return hasDiamods && !flags.disable_apperance;
  }, [hasDiamods, flags.disable_apperance]);

  return (
    <S.Wrap>
      <Screen>
        <Screen.Header title={t('settings_title')} />
        <Screen.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: paddingBottom + 16,
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
            {!!wallet && !wallet.isWatchOnly && !wallet.isExternal && (
              <List.Item
                value={
                  <Icon
                    style={styles.icon.static}
                    color="accentPrimary"
                    name={'ic-key-28'}
                  />
                }
                title={
                  <View style={styles.backupTextContainer.static}>
                    <Text variant="label1" numberOfLines={1} ellipsizeMode="tail">
                      {t('settings_backup_seed')}
                    </Text>
                    {backupIndicator}
                  </View>
                }
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
            {!!wallet && !wallet.isWatchOnly && hasSubscriptions && (
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
            {!!wallet && wallet.notifications.isAvailable && !wallet.isTestnet && (
              <List.Item
                value={<Icon color="accentPrimary" name={'ic-notification-28'} />}
                title={t('settings_notifications')}
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
            {isBatteryVisible && (
              <List.Item
                value={
                  <NewIcon
                    style={styles.icon.static}
                    color="accentBlue"
                    name={'ic-battery-28'}
                  />
                }
                title={t('battery.settings', {
                  betaLabel: config.get('battery_beta') ? '(Beta)' : '',
                })}
                onPress={handleBattery}
              />
            )}
            {!config.get('disable_holders_cards') && !!wallet && !wallet.isWatchOnly && (
              <List.Item
                value={
                  <NewIcon
                    style={styles.icon.static}
                    color="accentBlue"
                    name={'ic-creditcard-28'}
                  />
                }
                title={t('settings_bank_card')}
                onPress={() => nav.navigate(MainStackRouteNames.HoldersWebView)}
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
              items={themeVariants}
              selected={selectedTheme}
              onChange={setSelectedTheme}
              keyExtractor={(item) => item}
              width={176}
              renderItem={(item) => (
                <Text variant="label1">{t(`settings_theme_names.${item}`)}</Text>
              )}
            >
              <List.Item
                value={
                  <Text variant="label1" color="accentPrimary">
                    {t(`settings_theme_names.${selectedTheme}`)}
                  </Text>
                }
                title={t('settings_theme')}
              />
            </PopupSelect>
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
                  {nativeLocaleNames[i18n.locale]}
                </Text>
              }
              title={t('language.title')}
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
            {!!wallet && !wallet.isWatchOnly && !wallet.isExternal && (
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
        </Screen.ScrollView>
      </Screen>
    </S.Wrap>
  );
};

const styles = Steezy.create({
  icon: {
    marginTop: -2,
    marginBottom: -2,
  },
  backupTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  backupIndicatorContainer: {
    height: 24,
    paddingTop: 9.5,
    paddingBottom: 6.5,
    marginLeft: 8,
  },
});
