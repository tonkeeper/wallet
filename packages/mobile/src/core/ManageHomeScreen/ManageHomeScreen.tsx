import React, { memo, ReactNode } from 'react';
import { AssetCell, View } from '@tonkeeper/uikit';
import { NavBar } from '$uikit';
import DraggableFlashList from '$uikit/DraggableFlashList';
import { CellItemToRender } from '../../tabs/Wallet/content-providers/utils/types';
import { usePreparedWalletContent } from '../../tabs/Wallet/content-providers/utils/usePreparedWalletContent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavBarHeight } from '$shared/constants';
import { AssetCellMode } from '@tonkeeper/uikit/src/components/AssetCell';
import { tk } from '$wallet';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$wallet/managers/TokenApprovalManager';

export interface ManageHomeScreenProps {
  children: ReactNode;
}

export const ManageHomeScreen = memo<ManageHomeScreenProps>((props) => {
  const preparedContent = usePreparedWalletContent(true);
  const bottomInset = useSafeAreaInsets().bottom;

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

  return (
    <View style={{ flex: 1 }}>
      <NavBar isModal isClosedButton hideBackButton>
        Home screen
      </NavBar>
      <DraggableFlashList<CellItemToRender>
        onDragEnd={(order) => console.log(order)}
        keyExtractor={(item) => item.key}
        renderItem={({ item, drag }) => (
          <AssetCell
            onEyePress={handleApprovalUpdate}
            item={item}
            mode={AssetCellMode.EDITABLE}
            drag={drag}
          />
        )}
        contentContainerStyle={{ paddingBottom: NavBarHeight + bottomInset + 16 }}
        data={preparedContent}
      />
    </View>
  );
});
