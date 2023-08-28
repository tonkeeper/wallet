import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { List, TonIcon, View, copyText } from '@tonkeeper/uikit';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedAmount } from '../components/DetailedAmount';
import { DetailedHeader } from '../components/DetailedHeader';
import { ExtraListItem } from '../components/ExtraListItem';
import { t } from '../../../i18n';
import { memo } from 'react';
import {
  EncryptedComment,
  EncryptedCommentLayout,
} from '../../../components/EncryptedComment';
import { TonTransferActionData, TransactionEvent } from '@tonkeeper/core';

interface TonTransferContentProps {
  action: TonTransferActionData;
  event: TransactionEvent;
}

export const TonTransferContent = memo<TonTransferContentProps>((props) => {
  const { action, event } = props;

  return (
    <View>
      <DetailedInfoContainer>
        <DetailedHeader isScam={event.is_scam} isHide={action.isFailed}>
          <TonIcon size="large" />
        </DetailedHeader>
        <DetailedAmount
          destination={action.destination}
          hideFiat={action.isFailed}
          amount={action.amount}
        />
        <DetailedActionTime
          destination={action.destination}
          timestamp={event.timestamp}
        />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <AddressListItem
          destination={action.destination}
          recipient={action.recipient}
          sender={action.sender}
          hideName={event.is_scam}
        />
        <ExtraListItem extra={event.extra} />
        {/* {action.encrypted_comment && (
          <EncryptedComment
            layout={EncryptedCommentLayout.LIST_ITEM}
            encryptedComment={action.encrypted_comment}
            transactionType={TransactionActionType.TonTransfer}
            transactionId={event.event_id}
            sender={action.sender}
          />
        )} */}
        {!!action.comment && (
          <List.Item
            titleType="secondary"
            title={t('transactionDetails.comment')}
            onPress={copyText(action.comment)}
            value={action.comment}
            valueMultiline
          />
        )}
      </List>
    </View>
  );
});
