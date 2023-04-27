import { useMemo } from 'react';
import { t } from '$translation';
import { formatter } from '$utils/formatter';
import { openApproveTokenModal } from '$core/ModalContainer/ApproveToken/ApproveToken';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$store/zustand/tokenApproval/types';
import { ListButton, Spacer } from '$uikit';
import { CellItem, Content, ContentType } from '$core/ManageTokens/ManageTokens.types';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { useApprovedNfts, useJettonBalances } from '$hooks';
import { NFTModel } from '$store/models';

const baseNftCellData = (nft: NFTModel) => ({
  type: ContentType.Cell,
  picture: nft.content.image.baseUrl,
  title: nft.collection?.name,
  subtitle: 't',
  onPress: () =>
    openApproveTokenModal({
      type: TokenApprovalType.Collection,
      tokenAddress: nft.address,
      image: nft.content.image.baseUrl,
      name: nft.collection?.name,
    }),
});

export function useNftData() {
  const updateTokenStatus = useTokenApprovalStore(
    (state) => state.actions.updateTokenStatus,
  );
  const { enabled, pending, disabled } = useApprovedNfts();
  const data = useMemo(() => {
    const content: Content[] = [];

    if (pending.length) {
      content.push({
        type: ContentType.Title,
        title: t('approval.pending'),
      });

      content.push(
        ...pending.map(
          (nft, index) =>
            ({
              ...baseNftCellData(nft),
              attentionBackground: true,
              chevron: true,
              isFirst: index === 0,
              isLast: index === pending.length - 1,
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
          (nft, index) =>
            ({
              ...baseNftCellData(nft),
              isFirst: index === 0,
              leftContent: (
                <>
                  <ListButton
                    type="remove"
                    onPress={() =>
                      updateTokenStatus(
                        nft.collectionAddress,
                        TokenApprovalStatus.Declined,
                        TokenApprovalType.Jetton,
                      )
                    }
                  />
                  <Spacer x={16} />
                </>
              ),
              isLast: index === enabled.length - 1,
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
          (nft, index) =>
            ({
              ...baseNftCellData(nft),
              isFirst: index === 0,
              isLast: index === disabled.length - 1,
              leftContent: (
                <>
                  <ListButton
                    type="add"
                    onPress={() =>
                      updateTokenStatus(
                        nft.collectionAddress,
                        TokenApprovalStatus.Approved,
                        TokenApprovalType.Jetton,
                      )
                    }
                  />
                  <Spacer x={16} />
                </>
              ),
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

  return data;
}
