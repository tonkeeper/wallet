import { BrowserStackRouteNames, openDAppsSearch } from '$navigation';
import { useAppsListStore } from '$store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { FC, memo, useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Steezy, Text, View } from '@tonkeeper/uikit';
import { shallow } from 'zustand/shallow';
import { BrowserStackParamList } from '$navigation/BrowserStack/BrowserStack.interface';
import { SearchButton } from '$core/DAppsExplore/components';
import { List } from '$uikit/List/old/List';
import { PopularAppCell } from '$core/DAppsExplore/components/PopularAppCell/PopularAppCell';

export type DAppsExploreProps = NativeStackScreenProps<
  BrowserStackParamList,
  BrowserStackRouteNames.Category
>;

const DAppsCategoryComponent: FC<DAppsExploreProps> = (props) => {
  const { categoryId } = props.route.params;

  const tabBarHeight = useBottomTabBarHeight();

  const category = useAppsListStore(
    (s) => s.categories.find((item) => item.id === categoryId)!,
    shallow,
  );

  const handleSearchPress = useCallback(() => {
    openDAppsSearch();
  }, []);

  return (
    <Screen>
      <Screen.Header title={category.title} />
      <Screen.ScrollView
        indent={true}
        contentContainerStyle={styles.contentContainerStyle.static}
      >
        <List separator={false}>
          {category.apps.map((item, index) => (
            <PopularAppCell
              key={index}
              separator={index < category.apps.length - 1}
              icon={item.icon}
              url={item.url}
              name={item.name}
              description={item.description}
            />
          ))}
        </List>
      </Screen.ScrollView>
      <View style={[styles.searchBarContainer, { marginBottom: tabBarHeight }]}>
        <SearchButton onPress={handleSearchPress} />
      </View>
    </Screen>
  );
};

export const DAppsCategory = memo(DAppsCategoryComponent);

const styles = Steezy.create(({ colors }) => ({
  contentContainerStyle: {
    paddingBottom: 0,
  },
  searchBarContainer: {
    backgroundColor: colors.backgroundPageAlternate,
    padding: 16,
    position: 'relative',
  },
}));
