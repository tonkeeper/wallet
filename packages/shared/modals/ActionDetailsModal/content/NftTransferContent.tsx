import { List, View, Text } from '@tonkeeper/uikit';
import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedNftItem } from '../components/DetailedNftItem';
import { DetailedHeader } from '../components/DetailedHeader';
import { ExtraListItem } from '../components/ExtraListItem';
import { memo } from 'react';
import {
  CustomAccountEvent,
  CustomNftItemTransferAction,
} from '@tonkeeper/core/src/TonAPI';

interface NftTransferContentProps {
  action: CustomNftItemTransferAction;
  event: CustomAccountEvent;
}

export const NftTransferContent = memo<NftTransferContentProps>((props) => {
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
          <DetailedNftItem nftAddress={action.nft} />
        </DetailedHeader>
        <DetailedActionTime destination={event.destination} timestamp={event.timestamp} />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <AddressListItem
          destination={event.destination}
          recipient={action.recipient}
          sender={action.sender}
        />
        <ExtraListItem extra={event.extra} />
      </List>
    </View>
  );
});
