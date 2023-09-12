import { UnSubscribeActionListItem } from './items/UnSubscribeActionListItem';
import { JettonSwapActionListItem } from './items/JettonSwapActionListItem';
import { SubscribeActionListItem } from './items/SubscribeActionListItem';
import { modifyNftName } from '@tonkeeper/core/src/managers/NftsManager';
import { NftPreviewContent } from './NftPreviewContent';
import { ActionListItem } from './ActionListItem';
import { t } from '../../i18n';
import {
  ActivityActionType,
  AnyActivityAction,
  ActivityEvent,
  Address,
  ActivityItem,
} from '@tonkeeper/core';
import {
  Icon,
  ListItemContainer,
  ListItemContentText,
  Picture,
  Steezy,
  View,
} from '@tonkeeper/uikit';

export function renderActionItem(event: ActivityEvent, action: AnyActivityAction) {
  switch (action.type) {
    case ActivityActionType.TonTransfer:
      return (
        <ActionListItem event={event} action={action}>
          {!!action.comment && <ListItemContentText text={action.comment.trim()} />}
        </ActionListItem>
      );
    case ActivityActionType.JettonTransfer:
      return (
        <ActionListItem event={event} action={action}>
          {!!action.comment && <ListItemContentText text={action.comment.trim()} />}
        </ActionListItem>
      );
    case ActivityActionType.NftItemTransfer:
      return (
        <ActionListItem event={event} action={action} value="NFT">
          <NftPreviewContent nftAddress={action.nft} />
          {!!action.comment && <ListItemContentText text={action.comment.trim()} />}
        </ActionListItem>
      );
    case ActivityActionType.NftPurchase:
      return (
        <ActionListItem event={event} action={action}>
          <NftPreviewContent nftItem={action.nft} />
        </ActionListItem>
      );
    case ActivityActionType.SmartContractExec:
      return (
        <ActionListItem
          subtitle={Address.parse(action.contract.address).toShort()}
          title={t('transactions.smartcontract_exec')}
          iconName="ic-gear-28"
          action={action}
          event={event}
        />
      );
    case ActivityActionType.Unknown:
      return (
        <ActionListItem
          title={t('transactions.unknown')}
          subtitle={t('transactions.unknown_description')}
          subtitleNumberOfLines={2}
          action={action}
          event={event}
        />
      );
    case ActivityActionType.AuctionBid:
      return (
        <ActionListItem
          subtitle={modifyNftName(action.nft?.metadata?.name)}
          title={t('transactions.bid')}
          iconName="ic-tray-arrow-up-28"
          action={action}
          event={event}
        />
      );
    case ActivityActionType.ContractDeploy:
      return (
        <ActionListItem
          subtitle={Address.parse(action.address).toShort()}
          title={t('transactions.wallet_initialized')}
          iconName="ic-donemark-28"
          action={action}
          event={event}
        />
      );
    case ActivityActionType.ReceiveTRC20:
      return (
        <ActionListItem
          subtitle={Address.toShort(action.sender)}
          title={t('transaction_type_receive')}
          iconName="ic-tray-arrow-down-28"
          action={action}
          event={event}
          greenValue
        />
      );
    case ActivityActionType.SendTRC20:
      return (
        <ActionListItem
          subtitle={Address.toShort(action.recipient)}
          title={t('transaction_type_sent')}
          iconName="ic-tray-arrow-up-28"
          action={action}
          event={event}
        />
      );
    case ActivityActionType.JettonBurn:
      return (
        <ActionListItem
          subtitle={action.jetton.name}
          title={t('transactions.burned')}
          iconName="ic-fire-28"
          action={action}
          event={event}
        />
      );
    case ActivityActionType.JettonMint:
      return (
        <ActionListItem
          subtitle={action.jetton.name}
          title={t('transaction_type_receive')}
          action={action}
          event={event}
        />
      );
    case ActivityActionType.DepositStake:
      return (
        <ActionListItem
          subtitle={action.pool.name}
          title={t('transactions.deposit')}
          action={action}
          event={event}
          leftContent={
            <View style={styles.poolIconContainer}>
              {!!action.pool.icon ? (
                <Picture
                  style={styles.poolIcon}
                  uri={action.pool.icon}
                  resizeMode="contain"
                />
              ) : (
                <Icon name="ic-tonkeeper-28" />
              )}
            </View>
          }
        />
      );
    case ActivityActionType.WithdrawStake:
      return (
        <ActionListItem
          subtitle={action.pool.name}
          title={t('transactions.withdraw')}
          iconName="ic-donemark-28"
          action={action}
          event={event}
          leftContent={
            <View style={styles.poolIconContainer}>
              <Picture uri={action.pool.icon} />
            </View>
          }
        />
      );
    case ActivityActionType.WithdrawStakeRequest:
      return (
        <ActionListItem
          subtitle={action.pool.name}
          title={t('transactions.withdrawal_request')}
          iconName="ic-donemark-28"
          action={action}
          event={event}
          leftContent={
            <View style={styles.poolIconContainer}>
              <Picture uri={action.pool.icon} />
            </View>
          }
        />
      );
    case ActivityActionType.JettonSwap:
      return <JettonSwapActionListItem event={event} action={action} />;
    case ActivityActionType.Subscribe: // TODO:
      return <SubscribeActionListItem event={event} action={action} />;
    case ActivityActionType.UnSubscribe: // TODO:
      return <UnSubscribeActionListItem event={event} action={action} />;
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

type RenderItemOptions = {
  item: ActivityItem;
  index: number;
};

export const renderActivityItem = ({ item }: RenderItemOptions) => (
  <ListItemContainer isFirst={item.isFirst} isLast={item.isLast}>
    {renderActionItem(item.event, item.action)}
  </ListItemContainer>
);

const styles = Steezy.create(({ colors }) => ({
  poolIconContainer: {
    backgroundColor: colors.accentGreen,
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolIcon: {
    width: 28,
    height: 28,
  },
}));
