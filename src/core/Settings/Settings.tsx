import React, { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Rate, { AndroidMarket } from 'react-native-rate';
import { Alert, Linking, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';

import * as S from './Settings.style';
import { PopupSelect, ScrollHandler, Text } from '$uikit';
import { useNavigation, useTranslator } from '$hooks';
import {alwaysShowV4R1Selector, fiatCurrencySelector, showV4R1Selector} from '$store/main';
import { hasSubscriptionsSelector } from '$store/subscriptions';
import {
  openAppearance,
  openDeleteAccountDone,
  openDevMenu,
  openJettonsListSettingsStack,
  openLegalDocuments,
  openNotifications,
  openSecurity,
  openSecurityMigration,
  openSubscriptions,
} from '$navigation';
import {
  walletActions,
  walletOldBalancesSelector,
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
import { hNs, maskifyAddress, ns, trackEvent, useHasDiamondsOnBalance } from '$utils';
import { LargeNavBarInteractiveDistance } from '$uikit/LargeNavBar/LargeNavBar';
import { CellSection, CellSectionItem } from '$shared/components';
import { MainDB } from '$database';
import { useNotifications } from '$hooks/useNotifications';
import { useNotificationsBadge } from '$hooks/useNotificationsBadge';
import { jettonsBalancesSelector } from '$store/jettons';
import { useAllAddresses } from '$hooks/useAllAddresses';
import { useFlags } from '$utils/flags';

export const Settings: FC = () => {
  const flags = useFlags(['disable_apperance']);

  const t = useTranslator();
  const nav = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const notificationsBadge = useNotificationsBadge();
  const notifications = useNotifications();

  const fiatCurrency = useSelector(fiatCurrencySelector);
  const dispatch = useDispatch();
  const hasSubscriptions = useSelector(hasSubscriptionsSelector);
  const wallet = useSelector(walletWalletSelector);
  const version = useSelector(walletVersionSelector);
  const jettonBalances = useSelector(jettonsBalancesSelector);
  const allTonAddesses = useAllAddresses();
  const showV4R1 = useSelector(showV4R1Selector);

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
    Linking.openURL(t('settings_news_url')).catch((err) => console.log(err));
  }, [t]);

  const handleDiscussion = useCallback(() => {
    Linking.openURL(t('settings_discussion_url')).catch((err) => console.log(err));
  }, [t]);

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

  const handleChangeVersion = useCallback(
    (version: SelectableVersion) => {
      dispatch(walletActions.switchVersion(version));
    },
    [dispatch],
  );

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

  const handleJettonsList = useCallback(() => {
    openJettonsListSettingsStack();
  }, []);

  const handleRecovery = useCallback(() => {
    dispatch(walletActions.backupWallet());
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
      return <S.NotificationDeniedIndicator />;
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
            paddingTop: hNs(LargeNavBarHeight),
            paddingHorizontal: ns(16),
            paddingBottom: tabBarHeight,
            alignItems: IsTablet ? 'center' : undefined,
          }}
          scrollEventThrottle={16}
        >
          <S.Content>
            <CellSection>
              {hasSubscriptions && (
                <CellSectionItem onPress={handleSubscriptions} icon="ic-ticket-28">
                  {t('settings_subscriptions')}
                </CellSectionItem>
              )}
              {!!wallet && (
                <>
                  <CellSectionItem onPress={handleRecovery} icon="ic-key-28">
                    {t('settings_recovery_phrase')}
                  </CellSectionItem>
                  <PopupSelect
                    items={versions}
                    selected={version}
                    onChange={handleChangeVersion}
                    keyExtractor={(item) => item}
                    width={220}
                    renderItem={(version) => (
                      <S.WalletVersion>
                        <Text variant="label1" style={{ marginRight: ns(8) }}>
                          {SelectableVersionsConfig[version]?.label}
                        </Text>
                        <Text variant="body1" color="foregroundSecondary">
                          {maskifyAddress(
                            allTonAddesses[SelectableVersionsConfig[version]?.label],
                          )}
                        </Text>
                      </S.WalletVersion>
                    )}
                  >
                    <CellSectionItem
                      indicator={
                        <Text variant="label1" color="accentPrimary">
                          {SelectableVersionsConfig[version]?.label}
                        </Text>
                      }
                    >
                      {t('settings_wallet_version')}
                    </CellSectionItem>
                  </PopupSelect>
                  {jettonBalances.length ? (
                    <CellSectionItem onPress={handleJettonsList} icon="ic-jetton-28">
                      {t('settings_jettons_list')}
                    </CellSectionItem>
                  ) : null}
                  <CellSectionItem onPress={handleSecurity} icon="ic-shield-28">
                    {t('settings_security')}
                  </CellSectionItem>
                  {isAppearanceVisible && (
                    <CellSectionItem onPress={handleAppearance} icon="ic-appearance-28">
                      {t('settings_appearance')}
                    </CellSectionItem>
                  )}
                  <CellSectionItem onPress={handleResetWallet} icon="ic-door-28">
                    {t('settings_reset')}
                  </CellSectionItem>
                </>
              )}
            </CellSection>
            <CellSection>
              <CellSectionItem
                onPress={() => nav.navigate('ChooseCurrency')}
                indicator={
                  <S.SelectedCurrency>{fiatCurrency.toUpperCase()}</S.SelectedCurrency>
                }
              >
                {t('settings_primary_currency')}
              </CellSectionItem>
              {!!wallet && (
                <CellSectionItem
                  onPress={handleNotifications}
                  icon="ic-notification-28"
                  inlineContent={notificationIndicator}
                >
                  {t('settings_notifications')}
                </CellSectionItem>
              )}
            </CellSection>
            <CellSection>
              <CellSectionItem onPress={handleRateApp} icon="ic-star-28">
                {t('settings_rate')}
              </CellSectionItem>
              <CellSectionItem onPress={handleDiscussion} icon="ic-telegram-28">
                {t('settings_discussion')}
              </CellSectionItem>
              <CellSectionItem onPress={handleNews} icon="ic-telegram-28">
                {t('settings_news')}
              </CellSectionItem>
              <CellSectionItem onPress={handleFeedback} icon="ic-envelope-28">
                {t('settings_contact_support')}
              </CellSectionItem>
              <CellSectionItem onPress={handleLegal} icon="ic-doc-28">
                {t('settings_legal_documents')}
              </CellSectionItem>
            </CellSection>

            {!!wallet && (
              <CellSection>
                <CellSectionItem onPress={handleDeleteAccount} icon="ic-trash-bin-28">
                  {t('settings_delete_account')}
                </CellSectionItem>
              </CellSection>
            )}

            <TapGestureHandler numberOfTaps={5} onActivated={handleDevMenu}>
              <S.AppInfo>
                <S.AppInfoIcon />
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
          </S.Content>
          <View style={{ height: LargeNavBarInteractiveDistance }} />
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
