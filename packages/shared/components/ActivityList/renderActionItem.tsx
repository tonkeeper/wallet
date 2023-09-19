import { UnSubscribeActionListItem } from './items/UnSubscribeActionListItem';
import { JettonSwapActionListItem } from './items/JettonSwapActionListItem';
import { SubscribeActionListItem } from './items/SubscribeActionListItem';
import { ListItemContentText, ListItemContainer } from '@tonkeeper/uikit';
import { modifyNftName } from '@tonkeeper/core/src/managers/NftsManager';
import { ActionType, Address, AnyActionItem } from '@tonkeeper/core';
import { NftPreviewContent } from './NftPreviewContent';
import { ActionListItem } from './ActionListItem';
import { t } from '../../i18n';

import { getImplementationIcon } from '@tonkeeper/mobile/src/utils/staking';

export function renderActionListItem(action: AnyActionItem) {
  const { type, payload } = action;

  switch (type) {
    case ActionType.TonTransfer:
      return (
        <ActionListItem action={action}>
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
        </ActionListItem>
      );
    case ActionType.JettonTransfer:
      return (
        <ActionListItem action={action}>
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
        </ActionListItem>
      );
    case ActionType.NftItemTransfer:
      return (
        <ActionListItem action={action} value="NFT">
          <NftPreviewContent nftAddress={payload.nft} />
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
        </ActionListItem>
      );
    case ActionType.NftPurchase:
      return (
        <ActionListItem action={action}>
          <NftPreviewContent nftItem={payload.nft} />
        </ActionListItem>
      );
    case ActionType.SmartContractExec:
      return (
        <ActionListItem
          subtitle={Address.parse(payload.contract.address).toShort()}
          title={t('transactions.smartcontract_exec')}
          iconName="ic-gear-28"
          action={action}
        />
      );
    case ActionType.Unknown:
      return (
        <ActionListItem
          title={t('transactions.unknown')}
          subtitle={t('transactions.unknown_description')}
          subtitleNumberOfLines={2}
          action={action}
        />
      );
    case ActionType.AuctionBid:
      return (
        <ActionListItem
          subtitle={modifyNftName(payload.nft?.metadata?.name)}
          title={t('transactions.bid')}
          iconName="ic-tray-arrow-up-28"
          action={action}
        />
      );
    case ActionType.ContractDeploy:
      return (
        <ActionListItem
          subtitle={Address.parse(payload.address).toShort()}
          title={t('transactions.wallet_initialized')}
          iconName="ic-donemark-28"
          action={action}
        />
      );
    case ActionType.ReceiveTRC20:
      return (
        <ActionListItem
          subtitle={Address.toShort(payload.sender)}
          title={t('transaction_type_receive')}
          iconName="ic-tray-arrow-down-28"
          action={action}
          greenValue
        />
      );
    case ActionType.SendTRC20:
      return (
        <ActionListItem
          subtitle={Address.toShort(payload.recipient)}
          title={t('transaction_type_sent')}
          iconName="ic-tray-arrow-up-28"
          action={action}
        />
      );
    case ActionType.JettonBurn:
      return (
        <ActionListItem
          subtitle={payload.jetton.name}
          title={t('transactions.burned')}
          iconName="ic-fire-28"
          action={action}
        />
      );
    case ActionType.JettonMint:
      return (
        <ActionListItem
          subtitle={payload.jetton.name}
          title={t('transaction_type_receive')}
          action={action}
        />
      );
    case ActionType.DepositStake:
      return (
        <ActionListItem
          pictureSource={getImplementationIcon(action.payload.implementation)}
          title={t('transactions.deposit')}
          subtitle={payload.pool.name}
          action={action}
        />
      );
    case ActionType.WithdrawStake:
      return (
        <ActionListItem
          pictureSource={getImplementationIcon(action.payload.implementation)}
          title={t('transactions.withdraw')}
          subtitle={payload.pool.name}
          iconName="ic-donemark-28"
          action={action}
        />
      );
    case ActionType.WithdrawStakeRequest:
      return (
        <ActionListItem
          pictureSource={getImplementationIcon(action.payload.implementation)}
          title={t('transactions.withdrawal_request')}
          subtitle={payload.pool.name}
          iconName="ic-donemark-28"
          action={action}
        />
      );
    case ActionType.JettonSwap:
      return <JettonSwapActionListItem action={action} />;
    case ActionType.Subscribe:
      return <SubscribeActionListItem action={action} />;
    case ActionType.UnSubscribe:
      return <UnSubscribeActionListItem action={action} />;
    default:
      return (
        <ActionListItem
          title={action.simple_preview.name}
          subtitle={action.simple_preview.description}
          subtitleNumberOfLines={2}
          action={action}
        />
      );
  }
}

type RenderItemOptions = {
  item: AnyActionItem;
  index: number;
};

export const renderActionItem = ({ item }: RenderItemOptions) => (
  <ListItemContainer isFirst={item.isFirst} isLast={item.isLast}>
    {renderActionListItem(item)}
  </ListItemContainer>
);
