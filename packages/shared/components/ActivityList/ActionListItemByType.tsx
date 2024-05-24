import { UnSubscribeActionListItem } from './items/UnSubscribeActionListItem';
import { JettonSwapActionListItem } from './items/JettonSwapActionListItem';
import { SubscribeActionListItem } from './items/SubscribeActionListItem';
import { ListItemContainer, ListItemContentText } from '@tonkeeper/uikit';
import { ActionListItem, ActionListItemProps } from './ActionListItem';
import { Address } from '@tonkeeper/core';
import { NftPreviewContent } from './NftPreviewContent';
import { t } from '../../i18n';
import { memo } from 'react';

import { getImplementationIcon } from '@tonkeeper/mobile/src/utils/staking';
import { excludeUndefinedValues } from '@tonkeeper/core/src/utils/common';
import { ListItemEncryptedComment } from '@tonkeeper/uikit/src/components/List/ListItemEncryptedComment';
import { modifyNftName } from '@tonkeeper/mobile/src/wallet/managers/NftsManager';
import {
  ActionType,
  AnyActionItem,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { ActionListItemWithNft } from './ActionListItemWithNFT';

export const ActionListItemByType = memo<ActionListItemProps>((props) => {
  const { action } = props;
  const { type, payload } = action;

  const pureProps = excludeUndefinedValues(props);
  switch (type) {
    case ActionType.TonTransfer:
      return (
        <ActionListItem {...pureProps}>
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
          {!!payload.encrypted_comment && (
            <ListItemEncryptedComment
              encryptedComment={payload.encrypted_comment}
              actionId={action.action_id}
              sender={action.payload.sender!}
            />
          )}
        </ActionListItem>
      );
    case ActionType.JettonTransfer:
      return (
        <ActionListItem {...pureProps}>
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
          {!!payload.encrypted_comment && (
            <ListItemEncryptedComment
              encryptedComment={payload.encrypted_comment}
              actionId={action.action_id}
              sender={action.payload.sender!}
            />
          )}
        </ActionListItem>
      );
    case ActionType.NftItemTransfer:
    case ActionType.NftPurchase:
      return <ActionListItemWithNft {...pureProps} action={action} />;
    case ActionType.SmartContractExec:
      return (
        <ActionListItem
          subtitle={Address.parse(payload.contract.address).toShort()}
          title={t('transactions.smartcontract_exec')}
          iconName="ic-gear-28"
          {...pureProps}
        />
      );
    case ActionType.Unknown:
      return (
        <ActionListItem
          title={t('transactions.unknown')}
          subtitle={t('transactions.unknown_description')}
          subtitleNumberOfLines={2}
          {...pureProps}
        />
      );
    case ActionType.AuctionBid:
      return (
        <ActionListItem
          subtitle={modifyNftName(payload.nft?.metadata?.name)}
          title={t('transactions.bid')}
          iconName="ic-tray-arrow-up-28"
          {...pureProps}
        />
      );
    case ActionType.ContractDeploy:
      return (
        <ActionListItem
          subtitle={Address.parse(payload.address).toShort()}
          title={t('transactions.wallet_initialized')}
          iconName="ic-donemark-28"
          {...pureProps}
        />
      );
    case ActionType.ReceiveTRC20:
      return (
        <ActionListItem
          subtitle={Address.toShort(payload.sender)}
          title={t('transaction_type_receive')}
          iconName="ic-tray-arrow-down-28"
          greenValue
          {...pureProps}
        />
      );
    case ActionType.SendTRC20:
      return (
        <ActionListItem
          subtitle={Address.toShort(payload.recipient)}
          title={t('transaction_type_sent')}
          iconName="ic-tray-arrow-up-28"
          {...pureProps}
        />
      );
    case ActionType.JettonBurn:
      return (
        <ActionListItem
          subtitle={payload.jetton.name}
          title={t('transactions.burned')}
          iconName="ic-fire-28"
          {...pureProps}
        />
      );
    case ActionType.JettonMint:
      return (
        <ActionListItem
          subtitle={payload.jetton.name}
          title={t('transaction_type_receive')}
          {...pureProps}
        />
      );
    case ActionType.DepositStake:
      return (
        <ActionListItem
          pictureSource={getImplementationIcon(action.payload.implementation)}
          title={t('transactions.deposit')}
          subtitle={payload.pool.name}
          {...pureProps}
        />
      );
    case ActionType.WithdrawStake:
      return (
        <ActionListItem
          pictureSource={getImplementationIcon(action.payload.implementation)}
          title={t('transactions.withdraw')}
          subtitle={payload.pool.name}
          iconName="ic-donemark-28"
          {...pureProps}
        />
      );
    case ActionType.WithdrawStakeRequest:
      return (
        <ActionListItem
          pictureSource={getImplementationIcon(action.payload.implementation)}
          title={t('transactions.withdrawal_request')}
          subtitle={payload.pool.name}
          iconName="ic-donemark-28"
          {...pureProps}
        />
      );
    case ActionType.JettonSwap:
      return <JettonSwapActionListItem {...pureProps} action={action} />;
    case ActionType.Subscribe:
      return <SubscribeActionListItem {...pureProps} action={action} />;
    case ActionType.UnSubscribe:
      return <UnSubscribeActionListItem {...pureProps} action={action} />;
    default:
      return <ActionListItem {...pureProps} isSimplePreview />;
  }
});

type RenderItemOptions = {
  item: AnyActionItem;
  index: number;
};

export const renderActionItem = ({ item }: RenderItemOptions) => (
  <ListItemContainer isFirst={item.isFirst} isLast={item.isLast}>
    <ActionListItemByType action={item} />
  </ListItemContainer>
);
