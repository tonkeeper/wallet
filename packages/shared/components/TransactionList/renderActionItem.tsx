import { UnSubscribeActionListItem } from './items/UnSubscribeActionListItem';
import { JettonSwapActionListItem } from './items/JettonSwapActionListItem';
import { SubscribeActionListItem } from './items/SubscribeActionListItem';
import { modifyNftName } from '@tonkeeper/core/src/managers/NftsManager';
import { NftPreviewContent } from './NftPreviewContent';
import { ListItemContentText } from '@tonkeeper/uikit';
import { ActionListItem } from './ActionListItem';
import { t } from '../../i18n';
import {
  TransactionActionType,
  AnyTransactionAction,
  TransactionEvent,
  Address,
} from '@tonkeeper/core';

export function renderActionItem(event: TransactionEvent, action: AnyTransactionAction) {
  switch (action.type) {
    case TransactionActionType.TonTransfer:
      return (
        <ActionListItem event={event} action={action}>
          {!!action.comment && <ListItemContentText text={action.comment.trim()} />}
        </ActionListItem>
      );
    case TransactionActionType.JettonTransfer:
      return (
        <ActionListItem event={event} action={action}>
          {!!action.comment && <ListItemContentText text={action.comment.trim()} />}
        </ActionListItem>
      );
    case TransactionActionType.NftItemTransfer:
      return (
        <ActionListItem event={event} action={action} value="NFT">
          <NftPreviewContent nftAddress={action.nft} />
          {!!action.comment && <ListItemContentText text={action.comment.trim()} />}
        </ActionListItem>
      );
    case TransactionActionType.NftPurchase:
      return (
        <ActionListItem event={event} action={action}>
          <NftPreviewContent nftItem={action.nft} />
        </ActionListItem>
      );
    case TransactionActionType.JettonSwap:
      return <JettonSwapActionListItem event={event} action={action} />;
    case TransactionActionType.SmartContractExec:
      return (
        <ActionListItem
          subtitle={Address.parse(action.contract.address).toShort()}
          title={t('transactions.smartcontract_exec')}
          icon="ic-gear-28"
          action={action}
          event={event}
        />
      );
    case TransactionActionType.Unknown:
      return (
        <ActionListItem
          title={t('transactions.unknown')}
          subtitle={t('transactions.unknown_description')}
          subtitleNumberOfLines={2}
          action={action}
          event={event}
        />
      );
    case TransactionActionType.AuctionBid:
      return (
        <ActionListItem
          subtitle={modifyNftName(action.nft?.metadata?.name)}
          title={t('transactions.bid')}
          icon="ic-tray-arrow-up-28"
          action={action}
          event={event}
        />
      );
    case TransactionActionType.ContractDeploy:
      return (
        <ActionListItem
          subtitle={Address.parse(action.address).toShort()}
          title={t('transactions.wallet_initialized')}
          icon="ic-donemark-28"
          action={action}
          event={event}
        />
      );
    case TransactionActionType.Subscribe: // TODO:
      return <SubscribeActionListItem event={event} action={action} />;
    case TransactionActionType.UnSubscribe: // TODO:
      return <UnSubscribeActionListItem event={event} action={action} />;
    case TransactionActionType.ReceiveTRC20:
      return (
        <ActionListItem
          subtitle={Address.toShort(action.sender)}
          title={t('transaction_type_receive')}
          icon="ic-tray-arrow-down-28"
          action={action}
          event={event}
          greenValue
        />
      );
    case TransactionActionType.SendTRC20:
      return (
        <ActionListItem
          subtitle={Address.toShort(action.recipient)}
          title={t('transaction_type_sent')}
          icon="ic-tray-arrow-up-28"
          action={action}
          event={event}
        />
      );
    default:
      return (
        <ActionListItem
          title={action.simple_preview.name}
          subtitle={action.simple_preview.description}
          subtitleNumberOfLines={2}
          action={action}
          event={event}
        />
      );
  }
}
