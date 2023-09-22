import React, { useMemo, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import {
  ImageType,
  openApproveTokenModal,
} from '$core/ModalContainer/ApproveToken/ApproveToken';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$store/zustand/tokenApproval/types';
import { Button, ListButton, Spacer } from '$uikit';
import { CellItem, Content, ContentType } from '$core/ManageTokens/ManageTokens.types';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { useApprovedNfts } from '$hooks/useApprovedNfts';
import { JettonVerification } from '$store/models';
import { approveAll } from '$store/zustand/tokenApproval/helpers';
import { NftItem } from '@tonkeeper/core';

const baseNftCellData = (nft) => ({
  type: ContentType.Cell,
  picture: nft.content.image.baseUrl,
  title: nft.collection ? nft.collection?.name || t('nft_unnamed_collection') : nft.name,
  imageStyle: {
    borderRadius: 8,
  },
  subtitle: nft.collection
    ? t('approval.token_count', { count: (nft as any).count })
    : t('approval.single_token'),
  onPress: () =>
    openApproveTokenModal({
      imageType: ImageType.SQUARE,
      type: nft.collection?.address
        ? TokenApprovalType.Collection
        : TokenApprovalType.Token,
      verification: nft.isApproved
        ? JettonVerification.WHITELIST
        : JettonVerification.NONE,
      tokenAddress: nft.collection?.address || nft.address,
      image: nft.content.image.baseUrl,
      name: nft.collection?.name,
    }),
});

export function groupByCollection(
  nftItems: NftItem[]
): (NftItem & { count: number })[] {
  const grouped = nftItems.reduce((acc, nft) => {
    const uniqAddress = nft.collection?.address || nft.address;
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
  const [isExtendedEnabled, setIsExtendedEnabled] = useState(false);
  const [isExtendedDisabled, setIsExtendedDisabled] = useState(false);
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
        rightContent: pending.length >= 5 && (
          <Button
            onPress={() =>
              approveAll(
                pending.map((nft) => ({
                  address: nft.collection?.address || nft.address,
                  isCollection: !!nft.collection?.address,
                })),
              )
            }
            mode="secondary"
            size="navbar_small"
          >
            {t('approval.approve_all')}
          </Button>
        ),
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
      const groupedEnabled = groupByCollection(enabled);
      content.push(
        ...groupedEnabled.slice(0, !isExtendedEnabled ? 4 : undefined).map(
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
                        nft.collection?.address || nft.address,
                        TokenApprovalStatus.Declined,
                        nft.collection?.address
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
      if (!isExtendedEnabled && groupedEnabled.length > 4) {
        content.push({
          id: 'show_accepted_nfts',
          onPress: () => setIsExtendedEnabled(true),
          type: ContentType.ShowAllButton,
        });
      }
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
      const groupedDisabled = groupByCollection(disabled);

      content.push(
        ...groupedDisabled.slice(0, !isExtendedDisabled ? 4 : undefined).map(
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
                        nft.collection?.address || nft.address,
                        TokenApprovalStatus.Approved,
                        nft.collection?.address
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
      if (!isExtendedDisabled && groupedDisabled.length > 4) {
        content.push({
          id: 'show_disabled_nfts',
          onPress: () => setIsExtendedDisabled(true),
          type: ContentType.ShowAllButton,
        });
      }
      content.push({
        id: 'spacer_disabled',
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    return content;
  }, [
    disabled,
    enabled,
    isExtendedDisabled,
    isExtendedEnabled,
    pending,
    updateTokenStatus,
  ]);
}
