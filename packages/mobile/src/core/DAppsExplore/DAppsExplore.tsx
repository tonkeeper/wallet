import { BrowserStackRouteNames, openChooseCountry, openDAppsSearch } from '$navigation';
import { useAppsListStore, useConnectedAppsList } from '$store';
import { useFlags } from '$utils/flags';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  SearchButton,
  AboutDApps,
  FeaturedApps,
  ConnectedApps,
  AppsCategory,
  NotcoinBotIcon,
} from './components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  List,
  Screen,
  SegmentedControl,
  Spacer,
  Steezy,
  View,
} from '@tonkeeper/uikit';
import { shallow } from 'zustand/shallow';
import { BrowserStackParamList } from '$navigation/BrowserStack/BrowserStack.interface';
import { t } from '@tonkeeper/shared/i18n';
import { ScrollPositionContext } from '$uikit';
import { useFocusEffect, useTabPress } from '@tonkeeper/router';
import { useSelectedCountry } from '$store/zustand/methodsToBuy/useSelectedCountry';
import { CountryButton } from '@tonkeeper/shared/components';
import { Linking } from 'react-native';
import { config } from '$config';
import { useJettons, useNftsState } from '@tonkeeper/shared/hooks';
import { Address } from '@tonkeeper/core';

export type DAppsExploreProps = NativeStackScreenProps<
  BrowserStackParamList,
  BrowserStackRouteNames.Explore
>;

const DAppsExploreComponent: FC<DAppsExploreProps> = () => {
  const flags = useFlags(['disable_dapps']);
  const tabBarHeight = useBottomTabBarHeight();

  const { changeEnd } = useContext(ScrollPositionContext);

  const connectedApps = useConnectedAppsList();
  const selectedCountry = useSelectedCountry();

  const featuredApps = useAppsListStore(
    (s) => s.categories.find((category) => category.id === 'featured')?.apps || [],
    shallow,
  );

  const filteredFeaturedApps = useMemo(() => {
    return featuredApps.filter((app) => {
      if (app.excludeCountries && app.excludeCountries.includes(selectedCountry)) {
        return false;
      }
      if (app.includeCountries && !app.includeCountries.includes(selectedCountry)) {
        return false;
      }

      return true;
    });
  }, [featuredApps, selectedCountry]);

  const categories = useAppsListStore((s) => s.categories || [], shallow);

  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        apps: category.apps.filter((app) => {
          if (app.excludeCountries && app.excludeCountries.includes(selectedCountry)) {
            return false;
          }
          if (app.includeCountries && !app.includeCountries.includes(selectedCountry)) {
            return false;
          }

          return true;
        }),
      }))
      .filter((category) => category.id !== 'featured' && category.apps.length > 0);
  }, [categories, selectedCountry]);

  const {
    actions: { fetchPopularApps },
  } = useAppsListStore();

  const handleSearchPress = useCallback(() => {
    openDAppsSearch();
  }, []);

  const { jettonBalances } = useJettons();
  const accountNfts = useNftsState((s) => s.accountNfts);

  const [hasNotcoin, hasNotcoinVoucher] = useMemo(() => {
    const hasJetton = jettonBalances.some((balance) =>
      Address.compare(balance.jettonAddress, config.get('notcoin_jetton_master')),
    );
    const hasVoucher = Object.values(accountNfts).some(
      (nft) =>
        nft.collection &&
        Address.compare(nft.collection.address, config.get('notcoin_nft_collection')),
    );

    return [hasJetton, hasVoucher];
  }, [accountNfts, jettonBalances]);

  const showNotcoin = hasNotcoin || hasNotcoinVoucher;

  const openNotcoinBot = useCallback(async () => {
    try {
      await Linking.openURL(config.get('notcoin_bot_url'));
    } catch {}
  }, []);

  const [segmentIndex, setSegmentIndex] = useState(0);

  const showConnected = segmentIndex === 1;

  useEffect(() => {
    fetchPopularApps();
  }, [fetchPopularApps]);

  useFocusEffect(
    useCallback(() => {
      changeEnd(false);
    }, [changeEnd]),
  );

  useTabPress(() => {
    if (showConnected) {
      setSegmentIndex(0);
    }
  });

  return (
    <Screen alternateBackground={segmentIndex === 1}>
      <Screen.Header
        rightContent={
          <View style={styles.countryButtonContainer}>
            <CountryButton
              selectedCountry={selectedCountry}
              onPress={openChooseCountry}
            />
          </View>
        }
        alternateBackground={segmentIndex === 1}
      >
        <SegmentedControl
          onChange={(segment) => setSegmentIndex(segment)}
          index={segmentIndex}
          items={[t('browser.explore'), t('browser.connected')]}
          style={styles.segmentedControl}
          indicatorStyle={styles.segmentedControlIndicator}
        />
      </Screen.Header>
      <Screen.ScrollView
        contentContainerStyle={styles.contentContainerStyle.static}
        scrollEnabled={!(showConnected && connectedApps.length === 0)}
      >
        <View style={!!showConnected && styles.hidden}>
          {flags.disable_dapps ? (
            <AboutDApps />
          ) : (
            <>
              <FeaturedApps items={filteredFeaturedApps} />
              {showNotcoin ? (
                <>
                  <Spacer y={8} />
                  <List style={styles.notcoinList}>
                    <List.Item
                      leftContent={<NotcoinBotIcon style={styles.notcoinIcon} />}
                      onPress={openNotcoinBot}
                      title={t('notcoin.name')}
                      subtitle={t('notcoin.slogan')}
                      rightContent={
                        <Button
                          title={t('notcoin.open')}
                          size="small"
                          color="tertiary"
                          onPress={openNotcoinBot}
                        />
                      }
                    />
                  </List>
                </>
              ) : null}
              {filteredCategories.map((category) => (
                <AppsCategory key={category.id} category={category} />
              ))}
            </>
          )}
        </View>
        <View style={!showConnected && styles.hidden}>
          <ConnectedApps connectedApps={connectedApps} />
        </View>
        <Spacer y={16} />
      </Screen.ScrollView>
      <View style={[styles.searchBarContainer, { marginBottom: tabBarHeight - 1 }]}>
        <SearchButton onPress={handleSearchPress} />
      </View>
    </Screen>
  );
};

export const DAppsExplore = memo(DAppsExploreComponent);

const styles = Steezy.create(({ colors }) => ({
  container: {
    flex: 1,
  },
  countryButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 64,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  segmentedControl: {
    backgroundColor: 'transparent',
  },
  segmentedControlIndicator: {
    backgroundColor: colors.buttonSecondaryBackground,
  },
  contentContainerStyle: {
    paddingBottom: 0,
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
  searchBarContainer: {
    backgroundColor: colors.backgroundPageAlternate,
    padding: 16,
    position: 'relative',
  },
  notcoinList: {
    marginBottom: 0,
  },
  notcoinIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
}));
