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
import { useJettonBalances } from '$hooks';

const baseJettonCellData = (jettonBalance) => ({
  type: ContentType.Cell,
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
});

export function useJettonData() {
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
              ...baseJettonCellData(jettonBalance),
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
          (jettonBalance, index) =>
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
          (jettonBalance, index) =>
            ({
              ...baseJettonCellData(jettonBalance),
              isFirst: index === 0,
              isLast: index === disabled.length - 1,
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
