import React, { useCallback, useMemo, useRef } from 'react';
import { List, Screen, View } from '$uikit';
import { getCountries } from '$utils/countries/getCountries';
import { ListSeparator } from '$uikit/List/ListSeparator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { goBack } from '$navigation/imperative';
import { SearchNavBar } from '$core/ChooseCountry/components/SearchNavBar';
import { Steezy, Text } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';

const CELL_SIZE = 56;

const ListSeparatorItem = () => (
  <View style={styles.separatorContainer}>
    <ListSeparator />
  </View>
);

const RenderItem = ({
  item,
  isFirst,
  isLast,
}: {
  item: { code: string; name: string };
  isFirst: boolean;
  isLast: boolean;
}) => {
  const setSelectedCountry = useMethodsToBuyStore(
    (state) => state.actions.setSelectedCountry,
  );
  const selectedCountry = useMethodsToBuyStore((state) => state.selectedCountry);
  const handleSelectCountry = useCallback(() => {
    setSelectedCountry(item.code);
    goBack();
  }, [item.code, setSelectedCountry]);

  const containerStyle = [
    isFirst && styles.firstListItem,
    isLast && styles.lastListItem,
    styles.containerListItem,
  ];

  return (
    <View style={containerStyle}>
      <List.Item
        checkmark={selectedCountry === item.code}
        onPress={handleSelectCountry}
        title={item.name}
      />
    </View>
  );
};

const countriesList = getCountries();

export const ChooseCountry: React.FC = () => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const selectedCountry = useMethodsToBuyStore((state) => state.selectedCountry);
  const listRef = useRef();
  const selectedCountryIndex = useMemo(
    () => countriesList.findIndex((country) => country.code === selectedCountry),
    [selectedCountry],
  );
  const [searchValue, setSearchValue] = React.useState('');

  const filteredListBySearch = useMemo(() => {
    if (searchValue) {
      return countriesList.filter((country) => {
        const regex = new RegExp(`\\b${searchValue}`, 'gi');
        return country.name.match(regex);
      });
    }
    return countriesList;
  }, [searchValue]);

  const searchNavBar = useCallback(
    (scrollY) => (
      <SearchNavBar scrollY={scrollY} value={searchValue} onChangeText={setSearchValue} />
    ),
    [searchValue, setSearchValue],
  );

  return (
    <Screen>
      <Screen.Header customNavBar={searchNavBar} />
      <Screen.FlashList
        ListEmptyComponent={
          <View style={styles.emptyPlaceholder}>
            <Text color="textTertiary" type="body1">
              {t('choose_country.empty_placeholder')}
            </Text>
          </View>
        }
        initialScrollIndex={selectedCountryIndex}
        drawDistance={750}
        ItemSeparatorComponent={ListSeparatorItem}
        keyExtractor={(item) => item.code}
        ref={listRef}
        contentContainerStyle={{ paddingBottom: bottomInset + 16 }}
        estimatedItemSize={CELL_SIZE}
        renderItem={({ item, index }) => (
          <RenderItem
            item={item}
            isFirst={index === 0}
            isLast={filteredListBySearch.length - 1 === index}
          />
        )}
        data={filteredListBySearch}
      />
    </Screen>
  );
};

const styles = Steezy.create(({ corners, colors }) => ({
  emptyPlaceholder: {
    marginHorizontal: 32,
    alignItems: 'center',
    marginTop: 56,
  },
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
  separatorContainer: {
    marginHorizontal: 16,
  },
}));
