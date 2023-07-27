import React, { useCallback, useRef } from 'react';
import { List, NavBar, Screen, View } from '$uikit';
import { getCountries } from '$utils/countries/getCountries';
import { Steezy } from '$styles';
import { ListSeparator } from '$uikit/List/ListSeparator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { goBack } from '$navigation';
import { t } from '$translation';

const CELL_SIZE = 56;

const ListSeparatorItem = () => (
  <View style={styles.separatorContainer}>
    <ListSeparator />
  </View>
);

const RenderItem = ({
  item,
}: {
  item: { code: string; name: string; isFirst: boolean; isLast: boolean };
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
    item.isFirst && styles.firstListItem,
    item.isLast && styles.lastListItem,
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

  const goToIndex = useCallback(() => {
    const selectedCountryIndex = countriesList.findIndex(
      (country) => country.code === selectedCountry,
    );

    // don't scroll to first countries in FlashList
    if (selectedCountryIndex <= 8) {
      return;
    }

    listRef.current?.scrollToOffset({
      offset: (selectedCountryIndex - 1) * CELL_SIZE,
      animated: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <NavBar forceBigTitle isModal isClosedButton hideBackButton>
        {t('choose_country.title')}
      </NavBar>
      <Screen.FlashList
        onLayout={goToIndex}
        drawDistance={750}
        ItemSeparatorComponent={ListSeparatorItem}
        keyExtractor={(item) => item.code}
        ref={listRef}
        contentContainerStyle={{ paddingBottom: bottomInset + 16 }}
        estimatedItemSize={CELL_SIZE}
        renderItem={({ item }) => <RenderItem item={item} />}
        data={countriesList}
      />
    </Screen>
  );
};

const styles = Steezy.create(({ corners, colors }) => ({
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
