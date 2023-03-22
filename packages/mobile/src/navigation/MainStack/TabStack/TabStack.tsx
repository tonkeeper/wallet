import React, { FC, useContext, useMemo } from 'react';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Balances, DAppsExplore } from '$core';
import { TabsStackRouteNames } from '$navigation';
import { TabStackParamList } from './TabStack.interface';
import { Icon, ScrollPositionContext, View } from '$uikit';
import { usePreloadChart, useTheme } from '$hooks';
import { isAndroid, nfs, ns, trackEvent } from '$utils';
import { t } from '$translation';
import { SettingsStack } from '$navigation/SettingsStack/SettingsStack';
import { NFTs } from '$core/NFTs/NFTs';
import { TabBarBadgeIndicator } from './TabBarBadgeIndicator';
import { useNotificationsSubscribe } from '$hooks/useNotificationsSubscribe';
import { useFlags } from '$utils/flags';
import { nftsSelector } from '$store/nfts';
import { ActivityScreen } from '../../../tabs/Activity/ActivityScreen';
import { WalletScreen } from '../../../tabs/Wallet/WalletScreen';
import { DevFeature, useDevFeaturesToggle } from '$store';
import Animated from 'react-native-reanimated';
import { FONT } from '$styled';

const Tab = createBottomTabNavigator<TabStackParamList>();

const useHasNfts = () => {
  const { myNfts } = useSelector(nftsSelector);
  return Object.keys(myNfts).length > 0;
};

export const TabStack: FC = () => {
  const { bottomSeparatorStyle } = useContext(ScrollPositionContext);
  const flags = useFlags(['disable_nft_tab', 'disable_nft_tab_if_no_nft']);
  const { devFeatures } = useDevFeaturesToggle();
  const safeArea = useSafeAreaInsets();
  const hasNfts = useHasNfts();
  const theme = useTheme();
  
  useNotificationsSubscribe();
  usePreloadChart();

  const tabBarStyle = { height: ns(64) + (safeArea.bottom > 0 ? ns(20) : 0) };
  const containerTabStyle = useMemo(() => [
    tabBarStyle,
    styles.tabBarContainer,
    bottomSeparatorStyle,
  ], [safeArea.bottom, bottomSeparatorStyle, tabBarStyle]);  

  const isVisibleNftTab = React.useMemo(() => {
    if (flags.disable_nft_tab) {
      return false;
    }

    if (flags.disable_nft_tab_if_no_nft && !hasNfts) {
      return false;
    }

    return true;
  }, [flags.disable_nft_tab_if_no_nft, flags.disable_nft_tab, hasNfts]);

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
                { backgroundColor: theme.colors.backgroundPrimary }
              ]} 
            />
          ) : (
            <BlurView tint="dark" intensity={48} style={StyleSheet.absoluteFill}>
              <View 
                style={[
                  styles.tabBarBlurBackground,
                  { backgroundColor: theme.colors.backgroundPrimaryTrans }
                ]} 
              />
            </BlurView>
          )}
          <BottomTabBar {...props} />
        </Animated.View>
      )}
    >
      {devFeatures[DevFeature.NewFlow] ? (
        <>
          <Tab.Screen
            component={WalletScreen}
            name={TabsStackRouteNames.Balances}
            options={{
              tabBarLabel: t('wallet.screen_title'),
              tabBarIcon: ({ color }) => (
                <Icon colorHex={color} name="ic-wallet-28" />
              ),
            }}
          />
          <Tab.Screen
            component={ActivityScreen}
            name={TabsStackRouteNames.Activity}
            options={{
              tabBarLabel: t('activity.screen_title'),
              tabBarIcon: ({ color }) => (
                <Icon colorHex={color} name="ic-flash-28" />
              ),
            }}
          />
        </>
      ) : (
        <Tab.Screen
          component={Balances}
          name={TabsStackRouteNames.Balances}
          options={{
            tabBarLabel: t('tab_wallet'),
            tabBarIcon: ({ color }) => (
              <Icon colorHex={color} name="ic-home-28" />
            ),
          }}
        />
      )}

      {isVisibleNftTab && !devFeatures[DevFeature.NewFlow] && (
        <Tab.Screen
          component={NFTs}
          name={TabsStackRouteNames.NFT}
          options={{
            tabBarLabel: t('tab_nft'),
            tabBarIcon: ({ color }) => (
              <Icon colorHex={color} name="ic-nft-collection-28" />
            ),
          }}
        />
      )}
      <Tab.Screen
        component={DAppsExplore}
        name={TabsStackRouteNames.Explore}
        options={{
          tabBarLabel: t('tab_browser'),
          tabBarIcon: ({ color }) => (
            <Icon colorHex={color} name="ic-explore-28" />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            trackEvent('browser_open');
          },
        }}
      />
      <Tab.Screen
        component={SettingsStack}
        name={TabsStackRouteNames.SettingsStack}
        options={{
          tabBarLabel: t('tab_settings'),
          tabBarIcon: ({ color }) => (
            <View style={styles.settingsIcon}>
              <Icon colorHex={color} name="ic-settings-28" />
              <TabBarBadgeIndicator />
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

