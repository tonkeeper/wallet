import { List, View, Text } from '@tonkeeper/uikit';
import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedNftItem } from '../components/DetailedNftItem';
import { DetailedHeader } from '../components/DetailedHeader';
import { ExtraListItem } from '../components/ExtraListItem';
import { memo } from 'react';
import { NftPurchaseActionData, ActivityEvent } from '@tonkeeper/core';


interface NftPurchaseContentProps {
  action: NftPurchaseActionData;
  event: ActivityEvent;
}

export const NftPurchaseContent = memo<NftPurchaseContentProps>((props) => {
  const { action, event } = props;

  return (
    <View>
      <DetailedInfoContainer>
        {action.isFailed && <Text type="h2">NFT</Text>}
        <DetailedHeader
          isHide={action.isFailed}
          isScam={event.is_scam}
          indentButtom={false}
        >
          <DetailedNftItem nft={action.nft} />
        </DetailedHeader>
        <DetailedActionTime
          langKey="purchase_date"
          destination={action.destination}
          timestamp={event.timestamp}
        />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <AddressListItem destination="in" sender={action.seller} />
        <ExtraListItem extra={event.extra} />
      </List>
    </View>
  );
});
