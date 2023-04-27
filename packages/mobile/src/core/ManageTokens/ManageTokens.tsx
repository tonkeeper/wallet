import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react';

import { ListButton, Screen, Spacer, SpacerSizes, SText, Text, View } from '$uikit';
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
import { formatter } from '$utils/formatter';
import { StyleSheet } from 'react-native';
import { openApproveTokenModal } from '$core/ModalContainer/ApproveToken/ApproveToken';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$store/zustand/tokenApproval/types';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
enum ContentType {
  Title,
  Cell,
  Spacer,
}

type TitleItem = {
  type: ContentType.Title;
  title: string;
};

type SpacerItem = {
  type: ContentType.Spacer;
  bottom: SpacerSizes;
};

type CellItem = {
  type: ContentType.Cell;
  isFirst?: boolean;
  leftContent?: ReactNode;
  attentionBackground?: boolean;
  title?: string;
  chevron?: boolean;
  subtitle?: string;
  isLast?: boolean;
  picture?: string;
  onPress?: () => void;
};

type Content = CellItem | TitleItem | SpacerItem;

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
  const updateTokenStatus = useTokenApprovalStore(
    (state) => state.actions.updateTokenStatus,
  );

  const { enabled, pending, disabled } = useJettonBalances();

  const data = useMemo(() => {
    const content: Content[] = [];

    if (pending.length) {
      content.push({
        type: ContentType.Title,
        title: t('approval.pending'),
      });

      content.push(
        ...pending.map(
          (jettonBalance, index) =>
            ({
              attentionBackground: true,
              chevron: true,
              type: ContentType.Cell,
              isFirst: index === 0,
              isLast: index === pending.length - 1,
              picture: jettonBalance.metadata?.image,
              title: jettonBalance.metadata?.name,
              subtitle: formatter.format(jettonBalance.balance, {
                currency: jettonBalance.metadata?.symbol,
                currencySeparator: 'wide',
              }),
              onPress: () =>
                openApproveTokenModal({
                  type: TokenApprovalType.Jetton,
                  tokenAddress: jettonBalance.jettonAddress,
                  verification: jettonBalance.verification,
                  image: jettonBalance.metadata?.image,
                  name: jettonBalance.metadata?.name,
                }),
            } as CellItem),
        ),
      );
      content.push({
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    if (enabled.length) {
      content.push({
        type: ContentType.Title,
        title: t('approval.accepted'),
      });
      content.push(
        ...enabled.map(
          (jettonBalance, index) =>
            ({
              type: ContentType.Cell,
              isFirst: index === 0,
              leftContent: (
                <>
                  <ListButton
                    type="remove"
                    onPress={() =>
                      updateTokenStatus(
                        jettonBalance.jettonAddress,
                        TokenApprovalStatus.Declined,
                        TokenApprovalType.Jetton,
                      )
                    }
                  />
                  <Spacer x={16} />
                </>
              ),
              isLast: index === enabled.length - 1,
              picture: jettonBalance.metadata?.image,
              title: jettonBalance.metadata?.name,
              subtitle: formatter.format(jettonBalance.balance, {
                currency: jettonBalance.metadata?.symbol,
                currencySeparator: 'wide',
              }),
              onPress: () =>
                openApproveTokenModal({
                  type: TokenApprovalType.Jetton,
                  tokenAddress: jettonBalance.jettonAddress,
                  verification: jettonBalance.verification,
                  image: jettonBalance.metadata?.image,
                  name: jettonBalance.metadata?.name,
                }),
            } as CellItem),
        ),
      );
      content.push({
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    if (disabled.length) {
      content.push({
        type: ContentType.Title,
        title: t('approval.declined'),
      });
      content.push(
        ...disabled.map(
          (jettonBalance, index) =>
            ({
              type: ContentType.Cell,
              isFirst: index === 0,
              isLast: index === disabled.length - 1,
              picture: jettonBalance.metadata?.image,
              title: jettonBalance.metadata?.name,
              leftContent: (
                <>
                  <ListButton
                    type="add"
                    onPress={() =>
                      updateTokenStatus(
                        jettonBalance.jettonAddress,
                        TokenApprovalStatus.Approved,
                        TokenApprovalType.Jetton,
                      )
                    }
                  />
                  <Spacer x={16} />
                </>
              ),
              subtitle: formatter.format(jettonBalance.balance, {
                currency: jettonBalance.metadata?.symbol,
                currencySeparator: 'wide',
              }),
              onPress: () =>
                openApproveTokenModal({
                  type: TokenApprovalType.Jetton,
                  tokenAddress: jettonBalance.jettonAddress,
                  verification: jettonBalance.verification,
                  image: jettonBalance.metadata?.image,
                  name: jettonBalance.metadata?.name,
                }),
            } as CellItem),
        ),
      );
      content.push({
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    return content;
  }, [disabled, enabled, pending, updateTokenStatus]);

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
                <View
                  contentContainerStyle={styles.flashList.static}
                  style={styles.sectionContainer}
                >
                  <FlashList data={data} renderItem={FLashListItem} />
                </View>
              </Tabs.Section>
              <Tabs.Section index={1}>
                <FlashList
                  contentContainerStyle={[
                    styles.flashList.static,
                    { paddingBottom: bottomInset },
                  ]}
                  data={data}
                  renderItem={FLashListItem}
                />
              </Tabs.Section>
            </Tabs.PagerView>
          </View>
        </Tabs>
      </Screen>
    );
  }, [bottomInset, data, tab]);

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
        data={data}
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
