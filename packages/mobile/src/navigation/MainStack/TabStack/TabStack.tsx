import React, { FC, useContext, useMemo } from 'react';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { TabsStackRouteNames } from '$navigation';
import { TabStackParamList } from './TabStack.interface';
import { Icon, ScrollPositionContext, View } from '$uikit';
import { usePreloadChart } from '$hooks/usePreloadChart';
import { useTheme } from '$hooks/useTheme';
import { isAndroid, nfs, ns } from '$utils';
import { t } from '@tonkeeper/shared/i18n';
import { SettingsStack } from '$navigation/SettingsStack/SettingsStack';
import { TabBarBadgeIndicator } from './TabBarBadgeIndicator';
import { WalletScreen } from '../../../tabs/Wallet/WalletScreen';
import Animated from 'react-native-reanimated';
import { FONT } from '$styled';
import { useCheckForUpdates } from '$hooks/useCheckForUpdates';
import { useLoadExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { ActivityStack } from '$navigation/ActivityStack/ActivityStack';
import { BackupIndicator } from '$navigation/MainStack/TabStack/BackupIndicator';
import { useFetchMethodsToBuy } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { trackEvent } from '$utils/stats';
import { useRemoteBridge } from '$tonconnect';
import { BrowserStack } from '$navigation/BrowserStack/BrowserStack';
import { useWallet } from '@tonkeeper/shared/hooks';
import { useDAppsNotifications } from '$store';

const Tab = createBottomTabNavigator<TabStackParamList>();

export const TabStack: FC = () => {
  const { bottomSeparatorStyle } = useContext(ScrollPositionContext);
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();
  const { shouldShowRedDot, removeRedDot } = useDAppsNotifications();

  useRemoteBridge();
  useLoadExpiringDomains();
  useFetchMethodsToBuy();
  usePreloadChart();
  useCheckForUpdates();

  const tabBarStyle = { height: ns(64) + (safeArea.bottom > 0 ? ns(20) : 0) };
  const containerTabStyle = useMemo(
    () => [tabBarStyle, styles.tabBarContainer, bottomSeparatorStyle],
    [safeArea.bottom, bottomSeparatorStyle, tabBarStyle],
  );

  const wallet = useWallet();

  const isWatchOnly = wallet && wallet.isWatchOnly;

  return (
    <Tab.Navigator
      initialRouteName={TabsStackRouteNames.Balances}
      screenOptions={{
        lazy: true,
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accentPrimary,
        tabBarInactiveTintColor: theme.colors.foregroundSecondary,
        tabBarStyle: [styles.tabBarStyle, tabBarStyle],
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarIconStyle: styles.tabBarIconStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarAllowFontScaling: false,
      }}
      sceneContainerStyle={{
        backgroundColor: theme.colors.backgroundPrimary,
      }}
      tabBar={(props) => (
        <Animated.View style={containerTabStyle}>
          {isAndroid ? (
            <View
              style={[
                styles.tabBarSplashBackground,
                { backgroundColor: theme.colors.backgroundPrimary },
              ]}
            />
          ) : (
            <BlurView tint="dark" intensity={48} style={StyleSheet.absoluteFill}>
              <View
                style={[
                  styles.tabBarBlurBackground,
                  { backgroundColor: theme.colors.backgroundPrimaryTrans },
                ]}
              />
            </BlurView>
          )}
          <BottomTabBar {...props} />
        </Animated.View>
      )}
    >
      <Tab.Screen
        component={WalletScreen}
        name={TabsStackRouteNames.Balances}
        options={{
          tabBarLabel: t('wallet.screen_title'),
          tabBarIcon: ({ color }) => <Icon colorHex={color} name="ic-wallet-28" />,
        }}
      />
      <Tab.Screen
        component={ActivityStack}
        name={TabsStackRouteNames.Activity}
        listeners={{
          tabPress: (e) => {
            removeRedDot();
          },
        }}
        options={{
          tabBarLabel: t('activity.screen_title'),
          tabBarIcon: ({ color }) => (
            <View style={styles.settingsIcon}>
              <Icon colorHex={color} name="ic-flash-28" />
              <TabBarBadgeIndicator isVisible={shouldShowRedDot} />
            </View>
          ),
        }}
      />
      {!isWatchOnly ? (
        <Tab.Screen
          component={BrowserStack}
          name={TabsStackRouteNames.BrowserStack}
          options={{
            tabBarLabel: t('tab_browser'),
            tabBarIcon: ({ color }) => <Icon colorHex={color} name="ic-explore-28" />,
          }}
          listeners={{
            tabPress: (e) => {
              trackEvent('browser_open');
            },
          }}
        />
      ) : null}
      <Tab.Screen
        component={SettingsStack}
        name={TabsStackRouteNames.SettingsStack}
        options={{
          tabBarLabel: t('tab_settings'),
          tabBarIcon: ({ color }) => (
            <View style={styles.settingsIcon}>
              <Icon colorHex={color} name="ic-settings-28" />
              {!isWatchOnly ? <BackupIndicator /> : null}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    paddingHorizontal: ns(16),
    backgroundColor: 'transparent',
    position: 'absolute',
    borderTopWidth: StyleSheet.hairlineWidth,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarSplashBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarBlurBackground: {
    flex: 1,
  },
  tabBarStyle: {
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
  tabBarItemStyle: {
    height: ns(64),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabBarIconStyle: {
    width: ns(28),
    height: ns(28),
    flex: 0,
  },
  tabBarLabelStyle: {
    fontSize: nfs(12),
    lineHeight: nfs(16),
    fontFamily: FONT.medium,
    marginTop: ns(4),
    paddingTop: 0,
    alignSelf: 'center',
  },
  settingsIcon: {
    position: 'relative',
  },
});
