import React, { useMemo } from 'react';
import { t } from '$translation';
import {
  ImageType,
  openApproveTokenModal,
} from '$core/ModalContainer/ApproveToken/ApproveToken';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$store/zustand/tokenApproval/types';
import { ListButton, Spacer } from '$uikit';
import { CellItem, Content, ContentType } from '$core/ManageTokens/ManageTokens.types';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { useApprovedNfts } from '$hooks';
import { JettonVerification, NFTModel } from '$store/models';
import { Address } from '$libs/Ton';

const baseNftCellData = (nft: NFTModel) => ({
  type: ContentType.Cell,
  picture: nft.content.image.baseUrl,
  title: nft.collection?.name || nft.name,
  imageStyle: {
    borderRadius: 8,
  },
  subtitle: nft.collectionAddress
    ? t('approval.token_count', { count: nft.count })
    : t('approval.single_token'),
  onPress: () =>
    openApproveTokenModal({
      imageType: ImageType.SQUARE,
      type: nft.collectionAddress
        ? TokenApprovalType.Collection
        : TokenApprovalType.Token,
      verification: nft.isApproved
        ? JettonVerification.WHITELIST
        : JettonVerification.NONE,
      tokenAddress: nft.collectionAddress || new Address(nft.address).toString(false),
      image: nft.content.image.baseUrl,
      name: nft.collection?.name,
    }),
});

function groupByCollection(nftItems: NFTModel[]): (NFTModel & { count: number })[] {
  const grouped = nftItems.reduce((acc, nft) => {
    const uniqAddress = nft.collectionAddress || nft.address;
    if (!acc[uniqAddress]) {
      acc[uniqAddress] = {
        ...nft,
        count: 1,
      };
    } else {
      acc[uniqAddress].count++;
    }
    return acc;
  }, {});
  return Object.values(grouped);
}

export function useNftData() {
  const updateTokenStatus = useTokenApprovalStore(
    (state) => state.actions.updateTokenStatus,
  );
  const { enabled, pending, disabled } = useApprovedNfts();
  return useMemo(() => {
    const content: Content[] = [];

    if (pending.length) {
      content.push({
        id: 'pending',
        type: ContentType.Title,
        title: t('approval.pending'),
      });

      content.push(
        ...groupByCollection(pending).map(
          (nft, index, array) =>
            ({
              ...baseNftCellData(nft),
              id: nft.address,
              attentionBackground: true,
              chevron: true,
              separatorVariant: 'alternate',
              chevronColor: 'iconSecondary',
              isFirst: index === 0,
              isLast: index === array.length - 1,
            } as CellItem),
        ),
      );
      content.push({
        id: 'spacer_pending',
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    if (enabled.length) {
      content.push({
        id: 'enabled',
        type: ContentType.Title,
        title: t('approval.accepted'),
      });
      content.push(
        ...groupByCollection(enabled).map(
          (nft, index, array) =>
            ({
              ...baseNftCellData(nft),
              id: nft.address,
              isFirst: index === 0,
              leftContent: (
                <>
                  <ListButton
                    type="remove"
                    onPress={() =>
                      updateTokenStatus(
                        nft.collectionAddress || new Address(nft.address).toString(false),
                        TokenApprovalStatus.Declined,
                        nft.collectionAddress
                          ? TokenApprovalType.Collection
                          : TokenApprovalType.Token,
                      )
                    }
                  />
                  <Spacer x={16} />
                </>
              ),
              isLast: index === array.length - 1,
            } as CellItem),
        ),
      );
      content.push({
        id: 'spacer_enabled',
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    if (disabled.length) {
      content.push({
        id: 'disabled',
        type: ContentType.Title,
        title: t('approval.declined'),
      });
      content.push(
        ...groupByCollection(disabled).map(
          (nft, index, array) =>
            ({
              ...baseNftCellData(nft),
              id: nft.address,
              isFirst: index === 0,
              isLast: index === array.length - 1,
              leftContent: (
                <>
                  <ListButton
                    type="add"
                    onPress={() =>
                      updateTokenStatus(
                        nft.collectionAddress || new Address(nft.address).toString(false),
                        TokenApprovalStatus.Approved,
                        nft.collectionAddress
                          ? TokenApprovalType.Collection
                          : TokenApprovalType.Token,
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
        id: 'spacer_disabled',
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    return content;
  }, [disabled, enabled, pending, updateTokenStatus]);
}
