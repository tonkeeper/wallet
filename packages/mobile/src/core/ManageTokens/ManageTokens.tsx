import React, { FC, useCallback, useMemo, useState } from 'react';

import { Screen, Spacer, SText, View, Button } from '$uikit';
import { List } from '@tonkeeper/uikit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from '../../tabs/Wallet/components/Tabs';
import { Steezy } from '$styles';
import { FlashList } from '@shopify/flash-list';
import { t } from '@tonkeeper/shared/i18n';
import { ListSeparator } from '$uikit/List/ListSeparator';
import { StyleSheet } from 'react-native';
import { ContentType, Content } from '$core/ManageTokens/ManageTokens.types';
import { useJettonData } from '$core/ManageTokens/hooks/useJettonData';
import { useNftData } from '$core/ManageTokens/hooks/useNftData';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useParams } from '$navigation/imperative';
import { useInscriptionData } from '$core/ManageTokens/hooks/useInscriptionData';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

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
  const params = useParams<{ initialTab?: string }>();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [tab, setTab] = useState<string>(params?.initialTab || 'tokens');
  const jettonData = useJettonData();
  const nftData = useNftData();
  const inscriptionData = useInscriptionData();
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const tabsContent = useMemo(() => {
    return [
      {
        label: t('wallet.tonkens_tab_lable'),
        id: 'tokens',
        items: jettonData,
      },
      {
        label: t('wallet.nft_tab_lable'),
        id: 'collectibles',
        items: nftData,
      },
      {
        label: t('wallet.inscriptions_tab_label'),
        id: 'inscriptions',
        items: inscriptionData,
      },
    ].filter((content) => content.items.length);
  }, [inscriptionData, jettonData, nftData]);

  const renderList = useCallback(
    (data) => {
      return (
        <AnimatedFlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={76}
          contentContainerStyle={StyleSheet.flatten([
            styles.flashList.static,
            { paddingBottom: bottomInset },
          ])}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          data={data}
          renderItem={FLashListItem}
        />
      );
    },
    [bottomInset, scrollHandler],
  );

  const renderTabs = useCallback(() => {
    return (
      <Screen>
        <Tabs>
          <View style={styles.flex}>
            <Tabs.Header leftContentGradient withBackButton style={styles.tabsHeader}>
              <Tabs.ScrollableBar
                contentContainerStyle={styles.contentContainer.static}
                indent={false}
                containerStyle={styles.tabsContainer.static}
                itemStyle={styles.tabsItem.static}
                indicatorStyle={styles.tabsIndicator.static}
                scrollY={scrollY}
                onChange={({ value }) => setTab(value)}
                value={tab}
                items={tabsContent.map((content) => ({
                  label: content.label,
                  value: content.id,
                }))}
              />
            </Tabs.Header>
            <Tabs.PagerView initialPage={tab === 'collectibles' ? 1 : 0}>
              {tabsContent.map((content, idx) => (
                <Tabs.Section key={content.id} index={idx}>
                  {renderList(content.items)}
                </Tabs.Section>
              ))}
            </Tabs.PagerView>
          </View>
        </Tabs>
      </Screen>
    );
  }, [renderList, scrollY, tab, tabsContent]);

  if (tabsContent.length > 1) {
    return renderTabs();
  } else {
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
          data={tabsContent[0].items}
        />
      </Screen>
    );
  }
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
