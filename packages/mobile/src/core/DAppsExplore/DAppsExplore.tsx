import { useTranslator } from '$hooks';
import { openDAppBrowser, openDAppsSearch, TabsStackRouteNames } from '$navigation';
import { useAppsListStore, useConnectedAppsList } from '$store';
import { useFlags } from '$utils/flags';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { SearchButton, AboutDApps } from './components';
import * as S from './DAppsExplore.style';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabStackParamList } from '$navigation/MainStack/TabStack/TabStack.interface';
import { PagerView, Screen, Steezy, View } from '@tonkeeper/uikit';
import { List } from '$uikit';
import { ScanQRButton } from '../../components/ScanQRButton';
import { Alert } from 'react-native';
import { TonConnect } from '$tonconnect/TonConnect';
import { AppItem } from './components/AppItem/AppItem';
import { trackEvent } from '$utils';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { ListSeparator } from '@tonkeeper/uikit/src/components/List/ListSeparator';
import { SText } from '$uikit';

export type DAppsExploreProps = NativeStackScreenProps<
  TabStackParamList,
  TabsStackRouteNames.Explore
>;

export const DAppsExplore = memo<DAppsExploreProps>((props) => {
  const { initialCategory } = props.route?.params || {};
  const { setParams } = props.navigation;

  const flags = useFlags(['disable_dapps']);
  const refPagerView = useRef<any>();
  const t = useTranslator();
  const tabBarHeight = useBottomTabBarHeight();
  const { categories } = useAppsListStore();
  const connectedApps = useConnectedAppsList();

  useEffect(() => {
    if (initialCategory && categories.length > 0) {
      const idx = categories.findIndex((category) => category.id === initialCategory);
      requestAnimationFrame(() => refPagerView.current?.setPage(idx));
      setParams({ initialCategory: undefined });
    }
  }, [categories, initialCategory, setParams]);

  const handleSearchPress = useCallback(() => {
    openDAppsSearch();
  }, []);

  const handleOpenDapp = useCallback(
    (url, name) => () => {
      trackEvent('click_dapp', { url, name });

      openDAppBrowser(url);
    },
    [],
  );

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

  return (
    <Screen>
      <Screen.LargeHeader rightContent={<ScanQRButton />} title={t('browser.title')} />
      <PagerView ref={refPagerView}>
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
                  onPress={handleOpenDapp(item.url, item.name)}
                  picture={item.icon}
                  pictureStyle={styles.picture.static}
                  chevron
                  title={item.name}
                  subtitle={
                    <SText variant="body2" numberOfLines={2} color={'textSecondary'}>
                      {item.description}
                    </SText>
                  }
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
  picture: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
});
