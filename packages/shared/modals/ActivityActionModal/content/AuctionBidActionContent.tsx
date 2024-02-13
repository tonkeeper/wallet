import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { copyText, List, ListItem } from '@tonkeeper/uikit';
import { memo, useMemo } from 'react';
import { t } from '../../../i18n';
import {
  isTelegramUsername,
  domainToUsername,
} from '@tonkeeper/mobile/src/wallet/managers/NftsManager';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';

interface AuctionBidActionContentProps {
  action: ActionItem<ActionType.AuctionBid>;
}

export const AuctionBidActionContent = memo<AuctionBidActionContentProps>((props) => {
  const { action } = props;

  const name = useMemo(() => {
    const name = action.payload.nft?.metadata?.name;
    let title = t('transactionDetails.bid_name');
    let value = name;

    if (isTelegramUsername(name)) {
      value = domainToUsername(name);
    }

    return { title, value };
  }, []);

  const collectionName = useMemo(() => {
    return action.payload.nft?.collection?.name;
  }, [action]);

  return (
    <ActionModalContent action={action} label={t('activityActionModal.bid')}>
      <List>
        {name && (
          <ListItem
            onPress={copyText(name.value)}
            titleType="secondary"
            title={name.title}
            value={name.value}
          />
        )}
        {!!collectionName && (
          <ListItem
            onPress={copyText(collectionName)}
            titleType="secondary"
            title={t('transactionDetails.bid_collection_name')}
            value={collectionName}
          />
        )}
        <ExtraListItem extra={action.event.extra} />
      </List>
    </ActionModalContent>
  );
});
