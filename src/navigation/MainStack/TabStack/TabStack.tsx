import React, { FC, useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { Balances, DAppsExplore } from '$core';
import { TabsStackRouteNames } from '$navigation';
import { TabStackParamList } from './TabStack.interface';
import { Icon, ScrollPositionContext } from '$uikit';
import { useTheme } from '$hooks';
import { isAndroid, nfs, ns, trackEvent } from '$utils';
import { t } from '$translation';
import { SettingsStack } from '$navigation/SettingsStack/SettingsStack';
import { NFTs } from '$core/NFTs/NFTs';
import { TabBarBadgeIndicator } from './TabBarBadgeIndicator';
import { useNotificationsSubscribe } from '$hooks/useNotificationsSubscribe';
import { IconNames } from '$uikit/Icon/generated.types';
import { useFlags } from '$utils/flags';
import { nftsSelector } from '$store/nfts';

const Tab = createBottomTabNavigator<TabStackParamList>();

const useHasNfts = () => {
  const { myNfts } = useSelector(nftsSelector);
  return Object.keys(myNfts).length > 0;
};

export const TabStack: FC = () => {
  const theme = useTheme();
  const flags = useFlags(['disable_nft_tab', 'disable_nft_tab_if_no_nft']);
  const hasNfts = useHasNfts();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { isEnd: isScrollEnd } = useContext(ScrollPositionContext);
  // useSelector(mainSelector); // need for re-render when main state changed
  useNotificationsSubscribe();

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
      sceneContainerStyle={{
        backgroundColor: theme.colors.backgroundPrimary,
      }}
      screenOptions={({ route }) => ({
        lazy: true,
        headerShown: false,
        detachInactiveScreens: false,
        detachPreviousScreen: false,
        enableScreens: true,
        tabBarIcon: ({ color }) => {
          let iconName: IconNames = 'ic-home-28';
          if (route.name === TabsStackRouteNames.NFT) {
            iconName = 'ic-nft-collection-28';
          } else if (route.name === TabsStackRouteNames.SettingsStack) {
            iconName = 'ic-settings-28';
          } else if (route.name === TabsStackRouteNames.Explore) {
            iconName = 'ic-explore-28';
          }

          return (
            <View style={{ position: 'relative' }}>
              <Icon name={iconName} colorHex={color} />
              {route.name === TabsStackRouteNames.SettingsStack && (
                <TabBarBadgeIndicator />
              )}
            </View>
          );
        },
        tabBarBackground: () =>
          isAndroid ? (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.colors.backgroundPrimary,
              }}
            />
          ) : (
            <BlurView tint="dark" intensity={48} style={StyleSheet.absoluteFill}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.backgroundPrimaryTrans,
                }}
              />
            </BlurView>
          ),
        tabBarActiveTintColor: theme.colors.accentPrimary,
        tabBarInactiveTintColor: theme.colors.foregroundSecondary,
        tabBarStyle: {
          position: 'absolute',
          overflow: 'hidden',
          bottom: 0,
          left: 0,
          borderTopColor: isScrollEnd ? 'transparent' : theme.colors.border,
          paddingHorizontal: ns(16),
          backgroundColor: 'transparent',
          paddingTop: 0,
          marginTop: 0,
          height: ns(64) + (bottomInset > 0 ? ns(20) : 0),
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
          fontFamily: theme.font.medium,
          marginTop: ns(4),
          paddingTop: 0,
          alignSelf: 'center',
        },
        tabBarAllowFontScaling: false,
      })}
    >
      <Tab.Screen
        component={Balances}
        name={TabsStackRouteNames.Balances}
        options={{
          tabBarLabel: t('tab_wallet'),
        }}
      />
      {isVisibleNftTab && (
        <Tab.Screen
          component={NFTs}
          name={TabsStackRouteNames.NFT}
          options={{
            tabBarLabel: t('tab_nft'),
          }}
        />
      )}
      <Tab.Screen
        component={DAppsExplore}
        name={TabsStackRouteNames.Explore}
        options={{
          tabBarLabel: t('tab_browser'),
        }}
        listeners={{
          tabPress: e => {
            trackEvent('browser_open')
          },
        }}
      />
      <Tab.Screen
        component={SettingsStack}
        name={TabsStackRouteNames.SettingsStack}
        options={{
          tabBarLabel: t('tab_settings'),
        }}
      />
    </Tab.Navigator>
  );
};
