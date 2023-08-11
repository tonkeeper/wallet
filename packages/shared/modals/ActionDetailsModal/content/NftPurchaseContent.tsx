import { List, View, Text } from '@tonkeeper/uikit';
import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedNftItem } from '../components/DetailedNftItem';
import { DetailedHeader } from '../components/DetailedHeader';
import { ExtraListItem } from '../components/ExtraListItem';
import { memo } from 'react';
import { CustomAccountEvent, CustomNftPurchaseAction } from '@tonkeeper/core/src/TonAPI';

interface NftPurchaseContentProps {
  action: CustomNftPurchaseAction;
  event: CustomAccountEvent;
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
          destination={event.destination}
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
