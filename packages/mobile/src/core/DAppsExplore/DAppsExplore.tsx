import { BrowserStackRouteNames, openChooseCountry, openDAppsSearch } from '$navigation';
import { useAppsListStore } from '$store';
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
} from './components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  Screen,
  SegmentedControl,
  Steezy,
  View,
  isAndroid,
  ns,
} from '@tonkeeper/uikit';
import { shallow } from 'zustand/shallow';
import { BrowserStackParamList } from '$navigation/BrowserStack/BrowserStack.interface';
import { t } from '@tonkeeper/shared/i18n';
import { Text as RNText } from 'react-native';
import { ScrollPositionContext } from '$uikit';
import { useFocusEffect } from '@tonkeeper/router';
import { useSelectedCountry } from '$store/zustand/methodsToBuy/useSelectedCountry';

export type DAppsExploreProps = NativeStackScreenProps<
  BrowserStackParamList,
  BrowserStackRouteNames.Explore
>;

const getSelectedCountryStyle = (selectedCountry: string) => {
  if (selectedCountry === '*') {
    return {
      icon: (
        <View
          style={{
            marginTop: isAndroid ? ns(-1) : ns(1),
            marginLeft: isAndroid ? 0 : ns(2),
          }}
        >
          <RNText style={{ fontSize: ns(16) }}>🌍</RNText>
        </View>
      ),
      type: 'emoji',
    };
  }
  if (selectedCountry === 'NOKYC') {
    return {
      icon: (
        <View
          style={{
            marginTop: isAndroid ? ns(-1) : ns(0.5),
            marginLeft: isAndroid ? ns(-1) : ns(1),
          }}
        >
          <RNText style={{ fontSize: ns(14) }}>☠️</RNText>
        </View>
      ),
      type: 'emoji',
    };
  }

  return { title: selectedCountry, type: 'text' };
};

const DAppsExploreComponent: FC<DAppsExploreProps> = () => {
  const flags = useFlags(['disable_dapps']);
  const tabBarHeight = useBottomTabBarHeight();

  const { changeEnd } = useContext(ScrollPositionContext);

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

  useEffect(() => {
    fetchPopularApps();
  }, [fetchPopularApps]);

  useFocusEffect(() => {
    changeEnd(false);
  });

  const selectedCountryStyle = getSelectedCountryStyle(selectedCountry);

  const [segmentIndex, setSegmentIndex] = useState(0);

  const showConnected = segmentIndex === 1;

  return (
    <Screen>
      <Screen.Header
        rightContent={
          <Button
            size={selectedCountryStyle.type === 'emoji' ? 'icon' : 'small'}
            color="secondary"
            title={selectedCountryStyle.title}
            icon={selectedCountryStyle.icon}
            style={!selectedCountryStyle.icon && styles.regionButton.static}
            onPress={openChooseCountry}
          />
        }
      >
        <SegmentedControl
          onChange={(segment) => setSegmentIndex(segment)}
          index={segmentIndex}
          items={[t('browser.explore'), t('browser.connected')]}
          style={styles.segmentedControl}
        />
      </Screen.Header>
      <Screen.ScrollView contentContainerStyle={styles.contentContainerStyle.static}>
        <View style={!!showConnected && styles.hidden}>
          {flags.disable_dapps ? (
            <AboutDApps />
          ) : (
            <>
              <FeaturedApps items={filteredFeaturedApps} />
              {filteredCategories.map((category) => (
                <AppsCategory key={category.id} category={category} />
              ))}
            </>
          )}
        </View>
        <View style={!showConnected && styles.hidden}>
          <ConnectedApps />
        </View>
      </Screen.ScrollView>
      <View style={[styles.searchBarContainer, { marginBottom: tabBarHeight }]}>
        <SearchButton onPress={handleSearchPress} />
      </View>
    </Screen>
  );
};

export const DAppsExplore = memo(DAppsExploreComponent);

const styles = Steezy.create(() => ({
  container: {
    flex: 1,
  },
  regionButton: {
    marginRight: 16,
  },
  segmentedControl: {
    backgroundColor: 'transparent',
  },
  contentContainerStyle: {
    paddingBottom: 0,
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
  searchBarContainer: {
    padding: 16,
    position: 'relative',
  },
}));
