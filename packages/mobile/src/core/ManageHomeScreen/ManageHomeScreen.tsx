import React, { memo, useMemo } from 'react';
import { AssetCell, ListSeparator, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { NavBar } from '$uikit';
import { usePreparedWalletContent } from '../../tabs/Wallet/content-providers/utils/usePreparedWalletContent';
import { AssetCellMode } from '@tonkeeper/uikit/src/components/AssetCell';
import { tk } from '$wallet';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$wallet/managers/TokenApprovalManager';
import DraggableFlashList, { DragEndParams } from '$uikit/DraggableFlashList';
import { CellItemToRender } from '../../tabs/Wallet/content-providers/utils/types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { t } from '@tonkeeper/shared/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ItemSeparatorComponent() {
  return (
    <View style={styles.separatorContainer}>
      <ListSeparator />
    </View>
  );
}

export const ManageHomeScreen = memo(() => {
  const preparedContent = usePreparedWalletContent(true);
  const paddingBottom = useSafeAreaInsets().bottom;

  const handleApprovalUpdate = (identifier: string) => {
    const newStatus =
      tk.wallet.tokenApproval.state.data.tokens[identifier]?.current !==
      TokenApprovalStatus.Declined
        ? TokenApprovalStatus.Declined
        : TokenApprovalStatus.Approved;

    tk.wallet.tokenApproval.updateTokenStatus(
      identifier,
      newStatus,
      TokenApprovalType.Token,
    );
  };

  const handlePin = (identifier: string) => {
    tk.wallet.tokenApproval.togglePinAsset(identifier);
  };

  const handleUpdateOrder = (items: DragEndParams<CellItemToRender>) => {
    tk.wallet.tokenApproval.reorderPinnedAssets(items.data.map((item) => item.key));
  };

  const pinnedAssets = useMemo(
    () =>
      preparedContent
        .filter((asset) => typeof asset.pinnedIndex === 'number')
        .sort((a, b) => a.pinnedIndex! - b.pinnedIndex!)
        .map((asset, idx, arr) => ({
          ...asset,
          isFirst: idx === 0,
          isLast: idx === arr.length - 1,
        })),
    [preparedContent],
  );

  const DraggableList = useMemo(
    () =>
      pinnedAssets.length ? (
        <View>
          <View style={styles.headerContainer}>
            <Text type="label1">{t('manage_home_screen.pinned')}</Text>
          </View>
          <DraggableFlashList<CellItemToRender>
            key={'pinned-list'}
            data={pinnedAssets}
            onDragEnd={handleUpdateOrder}
            ItemSeparatorComponent={ItemSeparatorComponent}
            keyExtractor={(item) => item.key}
            renderItem={({ item, drag, isActiveDragging }) => (
              <AssetCell
                onEyePress={handleApprovalUpdate}
                onPinPress={handlePin}
                item={item}
                mode={AssetCellMode.DRAGGABLE}
                drag={drag}
                isActiveDragging={isActiveDragging}
              />
            )}
          />
          <Spacer y={16} />
          <View style={styles.headerContainer}>
            <Text type="label1">{t('manage_home_screen.all_assets')}</Text>
            <Text color="textSecondary" type="body2">
              {t('manage_home_screen.sorted_by_price')}
            </Text>
          </View>
        </View>
      ) : null,
    [pinnedAssets],
  );

  return (
    <View style={styles.container}>
      <NavBar isModal isClosedButton hideBackButton>
        {t('manage_home_screen.title')}
      </NavBar>
      <Animated.FlatList
        contentContainerStyle={{ paddingBottom: paddingBottom + 16 }}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListHeaderComponent={DraggableList}
        data={preparedContent}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <AssetCell
            onPinPress={handlePin}
            onEyePress={handleApprovalUpdate}
            item={item}
            mode={AssetCellMode.EDITABLE}
          />
        )}
      />
    </View>
  );
});

const styles = Steezy.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 18,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  separatorContainer: {
    paddingHorizontal: 16,
  },
});
