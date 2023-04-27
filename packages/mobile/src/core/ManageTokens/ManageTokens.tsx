import React, { FC, useCallback, useState } from 'react';

import { Screen, Spacer, SText, View } from '$uikit';
import { useJettonBalances } from '$hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JettonBalanceModel } from '$store/models';
import { Address } from '$libs/Ton';
import { Tabs } from '../../tabs/Wallet/components/Tabs';
import { Steezy } from '$styles';
import { FlashList } from '@shopify/flash-list';
import { t } from '$translation';
import { List } from '$uikit/List/new';
import { ListSeparator } from '$uikit/List/new/ListSeparator';
import { StyleSheet } from 'react-native';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { ContentType, Content } from '$core/ManageTokens/ManageTokens.types';
import { useJettonData } from '$core/ManageTokens/hooks/useJettonData';

export function reorderJettons(newOrder: JettonBalanceModel[]) {
  return newOrder.map((jettonBalance) => {
    const rawAddress = new Address(jettonBalance.jettonAddress).toString(false);
    return rawAddress;
  });
}

const FLashListItem = ({ item }: { item: Content }) => {
  switch (item.type) {
    case ContentType.Title:
      return (
        <SText style={styles.flashListTitle} variant="h3" color="textPrimary">
          {item.title}
        </SText>
      );
    case ContentType.Spacer:
      return <Spacer y={item.bottom} />;
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
            chevron={item.chevron}
            title={item.title}
            subtitle={item.subtitle}
            onPress={item.onPress}
            picture={item.picture}
            leftContent={item.leftContent}
          />
          {!item.isLast && <ListSeparator />}
        </View>
      );
  }
};

export const ManageTokens: FC = () => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [tab, setTab] = useState<string>('tokens');
  const jettonData = useJettonData();

  const renderTabs = useCallback(() => {
    return (
      <Screen>
        <Tabs>
          <View style={{ flex: 1 }}>
            <Tabs.Header withBackButton style={styles.tabsHeader}>
              <Tabs.Bar
                onChange={({ value }) => setTab(value)}
                value={tab}
                items={[
                  { label: t('wallet.tonkens_tab_lable'), value: 'tokens' },
                  { label: t('wallet.collectibles_tab_lable'), value: 'collectibles' },
                ]}
              />
            </Tabs.Header>
            <Tabs.PagerView>
              <Tabs.Section index={0}>
                <View style={styles.sectionContainer}>
                  <FlashList
                    contentContainerStyle={styles.flashList.static}
                    data={jettonData}
                    renderItem={FLashListItem}
                  />
                </View>
              </Tabs.Section>
              <Tabs.Section index={1}>
                <FlashList
                  contentContainerStyle={StyleSheet.flatten([
                    styles.flashList.static,
                    { paddingBottom: bottomInset },
                  ])}
                  data={jettonData}
                  renderItem={FLashListItem}
                />
              </Tabs.Section>
            </Tabs.PagerView>
          </View>
        </Tabs>
      </Screen>
    );
  }, [bottomInset, jettonData, tab]);

  // return renderTabs();

  return (
    <Screen>
      <Screen.Header title={t('approval.manage_tokens')} />
      <Screen.FlashList
        estimatedItemSize={76}
        contentContainerStyle={StyleSheet.flatten([
          styles.flashList.static,
          { paddingBottom: bottomInset },
        ])}
        data={jettonData}
        renderItem={FLashListItem}
      />
    </Screen>
  );
};

const styles = Steezy.create(({ safeArea, corners, colors }) => ({
  tabsHeader: {
    position: 'relative',
    paddingTop: safeArea.top,
    paddingBottom: 16,
  },
  sectionContainer: {},
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
}));
