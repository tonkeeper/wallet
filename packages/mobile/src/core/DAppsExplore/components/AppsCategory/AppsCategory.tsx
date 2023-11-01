import React, { FC, memo, useCallback, useMemo } from 'react';
import { IAppCategory } from '$store';
import { List } from '$uikit/List/old/List';
import { PopularAppCell } from '../PopularAppCell/PopularAppCell';
import { Spacer, Steezy, Text, TouchableOpacity, View, ns } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { chunk } from 'lodash';
import { useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@tonkeeper/router';
import { BrowserStackRouteNames } from '$navigation';
import { IsTablet } from '$shared/constants';

interface Props {
  category: IAppCategory;
}

const BUTTON_HIT_SLOP = {
  top: 26,
  bottom: 26,
  left: 26,
  right: 26,
};

const AppsCategoryComponent: FC<Props> = (props) => {
  const { category } = props;

  const nav = useNavigation();

  const chunks = useMemo(() => chunk(category.apps, 3), [category.apps]);

  const showAll = chunks.length > 1;

  const { width: windowWidth } = useWindowDimensions();

  const tabletChunkWidth =
    chunks.length > 2 ? (windowWidth - ns(56)) / 2 : (windowWidth - ns(40)) / 2;

  const chunkWidth = IsTablet ? tabletChunkWidth : windowWidth - ns(56);

  const singleChunkWidth = IsTablet ? (windowWidth - ns(40)) / 2 : windowWidth - ns(32);

  const handlePressAll = useCallback(() => {
    nav.push(BrowserStackRouteNames.Category, { categoryId: category.id });
  }, [category.id, nav]);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text type="h3">{category.title}</Text>
        {showAll ? (
          <TouchableOpacity
            onPress={handlePressAll}
            activeOpacity={0.6}
            hitSlop={BUTTON_HIT_SLOP}
          >
            <Text type="label1" color="accentBlue">
              {t('browser.apps_all')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView
        horizontal={true}
        contentContainerStyle={styles.contentContainerStyle.static}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={chunkWidth + ns(8)}
        decelerationRate="fast"
      >
        {chunks.map((apps, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <Spacer x={8} /> : null}
            <View style={{ width: chunks.length > 1 ? chunkWidth : singleChunkWidth }}>
              <List separator={false}>
                {apps.map((item, index) => (
                  <PopularAppCell
                    key={index}
                    separator={index < apps.length - 1}
                    icon={item.icon}
                    url={item.url}
                    name={item.name}
                    description={item.description}
                  />
                ))}
              </List>
            </View>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = Steezy.create(() => ({
  container: {
    marginTop: 16,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainerStyle: {
    paddingHorizontal: 16,
  },
}));

export const AppsCategory = memo(AppsCategoryComponent);
