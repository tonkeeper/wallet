import React, { useMemo, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { formatter } from '$utils/formatter';
import { openApproveTokenModal } from '$core/ModalContainer/ApproveToken/ApproveToken';
import { tk } from '$wallet';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$store/zustand/tokenApproval/types';
import { ListButton } from '$uikit';
import { CellItem, Content, ContentType } from '$core/ManageTokens/ManageTokens.types';
import { InscriptionBalance } from '@tonkeeper/core/src/TonAPI';
import { useInscriptionBalances } from '$hooks/useInscriptionBalances';

const baseInscriptionCellData = (inscription: InscriptionBalance) => ({
  type: ContentType.Cell,
  id: `${inscription.ticker}_${inscription.type}`,
  title: inscription.ticker,
  subtitle: formatter.format(
    formatter.fromNano(inscription.balance, inscription.decimals),
    {
      currency: inscription.ticker,
      currencySeparator: 'wide',
    },
  ),
  onPress: () =>
    openApproveTokenModal({
      type: TokenApprovalType.Inscription,
      tokenIdentifier: `${inscription.ticker}_${inscription.type}`,
      name: inscription.ticker,
    }),
});

export function useInscriptionData() {
  const [isExtendedEnabled, setIsExtendedEnabled] = useState(false);
  const [isExtendedDisabled, setIsExtendedDisabled] = useState(false);
  const { enabled, disabled } = useInscriptionBalances();
  return useMemo(() => {
    const content: Content[] = [];

    if (enabled.length) {
      content.push({
        id: 'enabled_title',
        type: ContentType.Title,
        title: t('approval.accepted'),
      });
      content.push(
        ...enabled.slice(0, !isExtendedEnabled ? 4 : undefined).map(
          (inscriptionBalance, index, array) =>
            ({
              ...baseInscriptionCellData(inscriptionBalance),
              isFirst: index === 0,
              leftContent: (
                <ListButton
                  type="remove"
                  onPress={() =>
                    tk.wallet.tokenApproval.updateTokenStatus(
                      `${inscriptionBalance.ticker}_${inscriptionBalance.type}`,
                      TokenApprovalStatus.Declined,
                      TokenApprovalType.Inscription,
                    )
                  }
                />
              ),
              isLast: index === array.length - 1,
            } as CellItem),
        ),
      );
      if (!isExtendedEnabled && enabled.length > 4) {
        content.push({
          id: 'show_accepted_inscriptionss',
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
          (inscriptionBalance, index, array) =>
            ({
              ...baseInscriptionCellData(inscriptionBalance),
              isFirst: index === 0,
              isLast: index === array.length - 1,
              leftContent: (
                <ListButton
                  type="add"
                  onPress={() =>
                    tk.wallet.tokenApproval.updateTokenStatus(
                      `${inscriptionBalance.ticker}_${inscriptionBalance.type}`,
                      TokenApprovalStatus.Approved,
                      TokenApprovalType.Inscription,
                    )
                  }
                />
              ),
            } as CellItem),
        ),
      );
      if (!isExtendedDisabled && disabled.length > 4) {
        content.push({
          id: 'show_disabled_inscriptions',
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
  }, [disabled, enabled, isExtendedDisabled, isExtendedEnabled]);
}
