import { UnSubscribeActionListItem } from './items/UnSubscribeActionListItem';
import { JettonSwapActionListItem } from './items/JettonSwapActionListItem';
import { SubscribeActionListItem } from './items/SubscribeActionListItem';
import { modifyNftName } from '@tonkeeper/core/src/managers/NftsManager';
import { ActionListItem, ActionListItemProps } from './ActionListItem';
import { ActionType, Address, AnyActionItem } from '@tonkeeper/core';
import { NftPreviewContent } from './NftPreviewContent';
import { t } from '../../i18n';
import {
  ListItemContentText,
  ListItemContainer,
  Picture,
  Steezy,
} from '@tonkeeper/uikit';

import { getImplementationIcon } from '@tonkeeper/mobile/src/utils/staking';

interface RenderActionListItemByTypeProps extends ActionListItemProps {
  action: AnyActionItem;
}

export function RenderActionListItemByType(props: RenderActionListItemByTypeProps) {
  const { action } = props;
  const { type, payload } = action;

  switch (type) {
    case ActionType.TonTransfer:
      return (
        <ActionListItem {...props}>
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
        </ActionListItem>
      );
    case ActionType.JettonTransfer:
      return (
        <ActionListItem {...props}>
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
        </ActionListItem>
      );
    case ActionType.NftItemTransfer:
      return (
        <ActionListItem value="NFT" {...props}>
          <NftPreviewContent nftAddress={payload.nft} />
          {!!payload.comment && <ListItemContentText text={payload.comment.trim()} />}
        </ActionListItem>
      );
    case ActionType.NftPurchase:
      return (
        <ActionListItem {...props}>
          <NftPreviewContent nftItem={payload.nft} />
        </ActionListItem>
      );
    case ActionType.SmartContractExec:
      return (
        <ActionListItem
          {...props}
          subtitle={Address.parse(payload.contract.address).toShort()}
          title={t('transactions.smartcontract_exec')}
          iconName="ic-gear-28"
        />
      );
    case ActionType.Unknown:
      return (
        <ActionListItem
          {...props}
          title={t('transactions.unknown')}
          subtitle={t('transactions.unknown_description')}
          subtitleNumberOfLines={2}
        />
      );
    case ActionType.AuctionBid:
      return (
        <ActionListItem
          {...props}
          subtitle={modifyNftName(payload.nft?.metadata?.name)}
          title={t('transactions.bid')}
          iconName="ic-tray-arrow-up-28"
        />
      );
    case ActionType.ContractDeploy:
      return (
        <ActionListItem
          {...props}
          subtitle={Address.parse(payload.address).toShort()}
          title={t('transactions.wallet_initialized')}
          iconName="ic-donemark-28"
        />
      );
    case ActionType.ReceiveTRC20:
      return (
        <ActionListItem
          {...props}
          subtitle={Address.toShort(payload.sender)}
          title={t('transaction_type_receive')}
          iconName="ic-tray-arrow-down-28"
          greenValue
        />
      );
    case ActionType.SendTRC20:
      return (
        <ActionListItem
          {...props}
          subtitle={Address.toShort(payload.recipient)}
          title={t('transaction_type_sent')}
          iconName="ic-tray-arrow-up-28"
        />
      );
    case ActionType.JettonBurn:
      return (
        <ActionListItem
          {...props}
          subtitle={payload.jetton.name}
          title={t('transactions.burned')}
          iconName="ic-fire-28"
        />
      );
    case ActionType.JettonMint:
      return (
        <ActionListItem
          {...props}
          subtitle={payload.jetton.name}
          title={t('transaction_type_receive')}
        />
      );
    case ActionType.DepositStake:
      return (
        <ActionListItem
          {...props}
          subtitle={payload.pool.name}
          title={t('transactions.deposit')}
          leftContent={
            <Picture
              source={getImplementationIcon(action.payload.implementation)}
              style={styles.poolIcon}
              resizeMode="contain"
            />
          }
        />
      );
    case ActionType.WithdrawStake:
      return (
        <ActionListItem
          {...props}
          subtitle={payload.pool.name}
          title={t('transactions.withdraw')}
          iconName="ic-donemark-28"
          leftContent={
            <Picture
              source={getImplementationIcon(action.payload.implementation)}
              style={styles.poolIcon}
              resizeMode="contain"
            />
          }
        />
      );
    case ActionType.WithdrawStakeRequest:
      return (
        <ActionListItem
          {...props}
          subtitle={payload.pool.name}
          title={t('transactions.withdrawal_request')}
          iconName="ic-donemark-28"
          leftContent={
            <Picture
              source={getImplementationIcon(action.payload.implementation)}
              style={styles.poolIcon}
              resizeMode="contain"
            />
          }
        />
      );
    case ActionType.JettonSwap:
      return <JettonSwapActionListItem {...props} />;
    case ActionType.Subscribe: // TODO:
      return <SubscribeActionListItem {...props} />;
    case ActionType.UnSubscribe: // TODO:
      return <UnSubscribeActionListItem {...props} />;
    default:
      return (
        <ActionListItem
          title={action.simple_preview.name}
          subtitle={action.simple_preview.description}
          subtitleNumberOfLines={2}
          {...props}
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
    <RenderActionListItemByType action={item} />
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
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
  },
}));
