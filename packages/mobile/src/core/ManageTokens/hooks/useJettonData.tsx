import React, { useMemo, useState } from 'react';
import { t } from '$translation';
import { formatter } from '$utils/formatter';
import { openApproveTokenModal } from '$core/ModalContainer/ApproveToken/ApproveToken';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$store/zustand/tokenApproval/types';
import { Button, ListButton, Spacer } from '$uikit';
import { CellItem, Content, ContentType } from '$core/ManageTokens/ManageTokens.types';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { useJettonBalances } from '$hooks/useJettonBalances';
import { approveAll } from '$store/zustand/tokenApproval/helpers';

const baseJettonCellData = (jettonBalance) => ({
  type: ContentType.Cell,
  id: jettonBalance.jettonAddress,
  picture: jettonBalance.metadata?.image,
  title: jettonBalance.metadata?.name,
  subtitle: formatter.format(jettonBalance.balance, {
    currency: jettonBalance.metadata?.symbol,
    currencySeparator: 'wide',
  }),
  onPress: () =>
    openApproveTokenModal({
      type: TokenApprovalType.Token,
      tokenAddress: jettonBalance.jettonAddress,
      verification: jettonBalance.verification,
      image: jettonBalance.metadata?.image,
      name: jettonBalance.metadata?.name,
    }),
});

export function useJettonData() {
  const [isExtendedEnabled, setIsExtendedEnabled] = useState(false);
  const [isExtendedDisabled, setIsExtendedDisabled] = useState(false);
  const updateTokenStatus = useTokenApprovalStore(
    (state) => state.actions.updateTokenStatus,
  );
  const { enabled, pending, disabled } = useJettonBalances();
  const data = useMemo(() => {
    const content: Content[] = [];

    if (pending.length) {
      content.push({
        id: 'pending_title',
        type: ContentType.Title,
        rightContent: pending.length >= 5 && (
          <Button
            onPress={() =>
              approveAll(pending.map((token) => ({ address: token.jettonAddress })))
            }
            mode="secondary"
            size="navbar_small"
          >
            {t('approval.approve_all')}
          </Button>
        ),
        title: t('approval.pending'),
      });

      content.push(
        ...pending.map(
          (jettonBalance, index) =>
            ({
              ...baseJettonCellData(jettonBalance),
              attentionBackground: true,
              chevron: true,
              chevronColor: 'iconSecondary',
              separatorVariant: 'alternate',
              isFirst: index === 0,
              isLast: index === pending.length - 1,
            } as CellItem),
        ),
      );
      content.push({
        id: 'pending_spacer',
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    if (enabled.length) {
      content.push({
        id: 'enabled_title',
        type: ContentType.Title,
        title: t('approval.accepted'),
      });
      content.push(
        ...enabled.slice(0, !isExtendedEnabled ? 4 : undefined).map(
          (jettonBalance, index, array) =>
            ({
              ...baseJettonCellData(jettonBalance),
              isFirst: index === 0,
              leftContent: (
                <>
                  <ListButton
                    type="remove"
                    onPress={() =>
                      updateTokenStatus(
                        jettonBalance.jettonAddress,
                        TokenApprovalStatus.Declined,
                        TokenApprovalType.Token,
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
      if (!isExtendedEnabled && enabled.length > 4) {
        content.push({
          id: 'show_accepted_jettons',
          onPress: () => setIsExtendedEnabled(true),
          type: ContentType.ShowAllButton,
        });
      }
      content.push({
        id: 'accepted_spacer',
        type: ContentType.Spacer,
        bottom: 16,
      });
    }

    if (disabled.length) {
      content.push({
        id: 'disabled_title',
        type: ContentType.Title,
        title: t('approval.declined'),
      });
      content.push(
        ...disabled.slice(0, !isExtendedDisabled ? 4 : undefined).map(
          (jettonBalance, index, array) =>
            ({
              ...baseJettonCellData(jettonBalance),
              isFirst: index === 0,
              isLast: index === array.length - 1,
              leftContent: (
                <>
                  <ListButton
                    type="add"
                    onPress={() =>
                      updateTokenStatus(
                        jettonBalance.jettonAddress,
                        TokenApprovalStatus.Approved,
                        TokenApprovalType.Token,
                      )
                    }
                  />
                  <Spacer x={16} />
                </>
              ),
            } as CellItem),
        ),
      );
      if (!isExtendedDisabled && disabled.length > 4) {
        content.push({
          id: 'show_disabled_jettons',
          onPress: () => setIsExtendedDisabled(true),
          type: ContentType.ShowAllButton,
        });
      }
      content.push({
        id: 'disabled_spacer',
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
  return data;
}

// Draggable jetton list, need to be fixed
/*
export function useJettonData() {
  const updateTokenStatus = useTokenApprovalStore(
    (state) => state.actions.updateTokenStatus,
  );
  const { enabled, pending, disabled } = useJettonBalances();
  const data = useMemo(() => {
    const content: { pending: Content[]; enabled: Content[]; disabled: Content[] } = {
      pending: [],
      enabled: [],
      disabled: [],
    };

    if (pending.length) {
      content.pending = pending.map(
        (jettonBalance, index) =>
          ({
            ...baseJettonCellData(jettonBalance),
            attentionBackground: true,
            chevron: true,
            separatorVariant: 'alternate',
            chevronColor: 'iconSecondary',
            isFirst: index === 0,
            isLast: index === pending.length - 1,
            id: jettonBalance.jettonAddress + '_pending',
          } as CellItem),
      );
    }

    if (enabled.length) {
      content.enabled = enabled.map(
        (jettonBalance, index) =>
          ({
            ...baseJettonCellData(jettonBalance),
            id: jettonBalance.jettonAddress + '_enabled',
            isFirst: index === 0,
            isDraggable: true,
            leftContent: (
              <>
                <ListButton
                  type="remove"
                  onPress={() => {
                    updateTokenStatus(
                      jettonBalance.jettonAddress,
                      TokenApprovalStatus.Declined,
                      TokenApprovalType.Token,
                    );
                  }}
                />
                <Spacer x={16} />
              </>
            ),
            isLast: index === enabled.length - 1,
          } as CellItem),
      );
    }

    if (disabled.length) {
      content.disabled = disabled.map(
        (jettonBalance, index) =>
          ({
            ...baseJettonCellData(jettonBalance),
            id: jettonBalance.jettonAddress + '_disabled',
            isFirst: index === 0,
            isLast: index === disabled.length - 1,
            leftContent: (
              <>
                <ListButton
                  type="add"
                  onPress={() => {
                    updateTokenStatus(
                      jettonBalance.jettonAddress,
                      TokenApprovalStatus.Approved,
                      TokenApprovalType.Token,
                    );
                  }}
                />
                <Spacer x={16} />
              </>
            ),
          } as CellItem),
      );
    }

    return content;
  }, [disabled, enabled, pending, updateTokenStatus]);

  return data;
}
*/
