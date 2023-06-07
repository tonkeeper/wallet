import { useTranslator } from '$hooks';
import { openDAppBrowser, openDAppsSearch, TabsStackRouteNames } from '$navigation';
import { useAppsListStore, useConnectedAppsList } from '$store';
import { useFlags } from '$utils/flags';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { memo, useCallback, useEffect } from 'react';
import { SearchButton, AboutDApps } from './components';
import * as S from './DAppsExplore.style';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabStackParamList } from '$navigation/MainStack/TabStack/TabStack.interface';
import { List, PagerView, Screen, Steezy, View } from '@tonkeeper/uikit';
import { ScanQRButton } from '../../components/ScanQRButton';
import { Alert } from 'react-native';
import { TonConnect } from '$tonconnect/TonConnect';
import { AppItem } from './components/AppItem/AppItem';
import { trackEvent } from '$utils';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { ListSeparator } from '@tonkeeper/uikit/src/components/List/ListSeparator';

export type DAppsExploreProps = NativeStackScreenProps<
  TabStackParamList,
  TabsStackRouteNames.Explore
>;

export const BrowserScreen = memo<DAppsExploreProps>((props) => {
  const { initialCategory } = props.route?.params || {};
  const { setParams } = props.navigation;

  const flags = useFlags(['disable_dapps']);

  const t = useTranslator();
  const tabBarHeight = useBottomTabBarHeight();
  const { categories } = useAppsListStore();
  const connectedApps = useConnectedAppsList();

  useEffect(() => {
    if (initialCategory) {
      setParams({ initialCategory: undefined });
    }
  }, [initialCategory]);

  const handleSearchPress = useCallback(() => {
    openDAppsSearch();
  }, []);

  if (flags.disable_dapps) {
    return (
      <Screen>
        <Screen.LargeHeader rightContent={<ScanQRButton />} title={t('browser.title')} />
        <Screen.ScrollView>
          <S.ContentWrapper>
            <S.Content>
              <AboutDApps />
            </S.Content>
          </S.ContentWrapper>
        </Screen.ScrollView>
      </Screen>
    );
  }

  console.log(connectedApps.length);

  return (
    <Screen>
      <Screen.LargeHeader 
        rightContent={<ScanQRButton />}
        title={t('browser.title')}
      />
      <PagerView>
        <PagerView.Header>
          <View style={styles.connectedContainer}>
            {connectedApps.map((app, index) => (
              <AppItem
                key={`${app.name}_${app.url}`}
                index={index}
                name={app.name}
                iconUri={app.icon}
                onPress={() => {
                  trackEvent('click_dapp', { url: app.url, name: app.name });
                  openDAppBrowser(app.url);
                }}
                onLongPress={() => {
                  Alert.alert(t('browser.remove_alert.title', { name: app.name }), '', [
                    {
                      text: t('cancel'),
                      style: 'cancel',
                    },
                    {
                      text: t('browser.remove_alert.approve_button'),
                      style: 'destructive',
                      onPress: () => TonConnect.disconnect(app.url),
                    },
                  ]);
                }}
              />
            ))}
          </View>
        </PagerView.Header>
        {categories.map((category) => (
          <PagerView.Page key={category.id} tabLabel={category.title}>
            <ScrollableList
              ScrollableComponent={PagerView.FlashList}
              estimatedItemSize={1000}
              data={category.apps}
              renderItem={({ item }) => (
                <List.Item
                  onPress={() => {}}
                  pictureCorner="small"
                  picture={item.icon}
                  title={item.name}
                  subtitle={item.description}
                  subtitleNumberOfLines={3}
                  chevron
                />
              )}
            />
          </PagerView.Page>
        ))}
      </PagerView>
      <S.ContentWrapper>
        <S.Content>
          <S.SearchBarContainer tabBarHeight={tabBarHeight}>
            <SearchButton onPress={handleSearchPress} />
          </S.SearchBarContainer>
        </S.Content>
      </S.ContentWrapper>
    </Screen>
  );
});
interface ScrollableList extends FlashListProps<any> {
  ScrollableComponent?: any;
}

const WrapRenderItem = (renderItem, countItems, info) => {
  const isLast = info.index === countItems - 1;
  const isFirst = info.index === 0;

  const containerStyle = [
    isFirst && scrollableListStyles.firstListItem,
    isLast && scrollableListStyles.lastListItem,
    scrollableListStyles.containerListItem,
  ];

  return (
    <View style={containerStyle}>
      {renderItem(info)}
      {!isLast && <ListSeparator />}
    </View>
  );
};

const ScrollableList = memo<ScrollableList>((props) => {
  const { data, ScrollableComponent, ...other } = props;
  const Component = ScrollableComponent ?? FlashList;

  return (
    <Component
      {...other}
      data={data}
      getItemType={(item) => item.type}
      renderItem={(info) => WrapRenderItem(props.renderItem, data?.length, info)}
    />
  );
});

const scrollableListStyles = Steezy.create(({ corners, colors }) => ({
  firstListItem: {
    borderTopLeftRadius: corners.medium,
    borderTopRightRadius: corners.medium,
  },
  lastListItem: {
    borderBottomLeftRadius: corners.medium,
    borderBottomRightRadius: corners.medium,
  },
  containerListItem: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
    marginHorizontal: 16,
  },
}));

const styles = Steezy.create({
  connectedContainer: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
