import React, { FC } from 'react';

import { Screen, Spacer, SText, View, Button } from '$uikit';
import { List } from '@tonkeeper/uikit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Steezy } from '$styles';
import { t } from '@tonkeeper/shared/i18n';
import { ListSeparator } from '$uikit/List/ListSeparator';
import { StyleSheet } from 'react-native';
import { ContentType, Content } from '$core/ManageTokens/ManageTokens.types';
import { useNftData } from '$core/ManageTokens/hooks/useNftData';
const FLashListItem = ({
  item,
  renderDragButton,
}: {
  item: Content;
  renderDragButton?: () => JSX.Element;
}) => {
  switch (item.type) {
    case ContentType.Title:
      return (
        <View style={styles.titleContainer}>
          <SText style={styles.flashListTitle} variant="h3" color="textPrimary">
            {item.title}
          </SText>
          {item.rightContent}
        </View>
      );
    case ContentType.Spacer:
      return <Spacer y={item.bottom} />;
    case ContentType.ShowAllButton:
      return (
        <View style={styles.showAllButtonWrap}>
          <Button onPress={item.onPress} mode="secondary" size="medium_rounded">
            {t('approval.show_all')}
          </Button>
        </View>
      );
    case ContentType.Cell:
      const containerStyle = [
        item.isFirst && styles.firstListItem,
        item.isLast && styles.lastListItem,
        styles.containerListItem,
        item.attentionBackground && styles.attentionBackground,
      ];
      return (
        <View style={containerStyle}>
          <List.Item
            gestureHandler
            pictureStyle={item.imageStyle}
            chevron={item.chevron}
            chevronColor={item.chevronColor}
            title={item.title}
            subtitle={item.subtitle}
            onPress={item.onPress}
            picture={item.picture}
            leftContent={item.leftContent}
            value={item.isDraggable && renderDragButton?.()}
          />
          {!item.isLast && <ListSeparator />}
        </View>
      );
  }
};

export const ManageTokens: FC = () => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const nftData = useNftData();

  return (
    <Screen>
      <Screen.Header title={t('approval.manage_tokens')} />
      <Screen.FlashList
        keyExtractor={(item) => item?.id}
        estimatedItemSize={76}
        renderItem={FLashListItem}
        contentContainerStyle={StyleSheet.flatten([
          styles.flashList.static,
          { paddingBottom: bottomInset },
        ])}
        data={nftData}
      />
    </Screen>
  );
};

const styles = Steezy.create(({ safeArea, corners, colors }) => ({
  tabsHeader: {
    position: 'relative',
    paddingTop: safeArea.top,
  },
  flex: {
    flex: 1,
  },
  flashList: {
    paddingHorizontal: 16,
  },
  flashListTitle: {
    paddingVertical: 14,
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
  },
  attentionBackground: {
    backgroundColor: colors.backgroundContentAttention,
  },
  showAllButtonWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsContainer: { paddingBottom: 16 },
  tabsItem: { paddingTop: 16, paddingBottom: 8 },
  tabsIndicator: { bottom: 0 },
  contentContainer: {
    paddingLeft: 65,
  },
}));
