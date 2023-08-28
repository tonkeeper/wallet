
import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { ListItem } from '@tonkeeper/uikit/src/components/List/ListItem';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { DetailedAmount } from '../components/DetailedAmount';
import { ExtraListItem } from '../components/ExtraListItem';
import { List, View, copyText } from '@tonkeeper/uikit';
import { memo, useMemo } from 'react';
import { t } from '../../../i18n';
import {
  domainToUsername,
  isTelegramUsername,
} from '@tonkeeper/core/src/managers/NftsManager';
import { AuctionBidActionData, TransactionEvent } from '@tonkeeper/core';

interface AuctionBidContentProps {
  action: AuctionBidActionData;
  event: TransactionEvent;
}

export const AuctionBidContent = memo<AuctionBidContentProps>((props) => {
  const { action, event } = props;

  const name = useMemo(() => {
    const name = action.nft?.metadata?.name;
    let title = t('transactionDetails.bid_name');
    let value = name;

    if (isTelegramUsername(name)) {
      value = domainToUsername(name);
    }

    return { title, value };
  }, []);

  const collectionName = useMemo(() => {
    return action.nft?.collection?.name;
  }, [action]);

  return (
    <View>
      <DetailedInfoContainer>
        <DetailedAmount
          destination={action.destination}
          symbol={action.amount.token_name}
          amount={action.amount.value}
          hideFiat={action.isFailed}
        />
        <DetailedActionTime
          langKey="bid_date"
          destination={action.destination}
          timestamp={event.timestamp}
        />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
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
        <ExtraListItem extra={event.extra} />
      </List>
    </View>
  );
});
