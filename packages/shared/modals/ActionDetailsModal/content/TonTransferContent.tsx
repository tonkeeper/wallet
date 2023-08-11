import { DetailedInfoConatiner } from '../components/DetailedInfoConatiner';
import { DetailedActionTime } from '../components/DetailedActionTime';
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
import {
  ActionTypeEnum,
  TonTransferAction,
  CustomAccountEvent,
} from '@tonkeeper/core/src/TonAPI';

interface TonTransferContentProps {
  event: CustomAccountEvent;
  action: TonTransferAction;
}

export const TonTransferContent = memo<TonTransferContentProps>((props) => {
  const { action, event } = props;

  return (
    <View>
      <DetailedInfoConatiner>
        <DetailedHeader isScam={event.is_scam}>
          <TonIcon size="large" />
        </DetailedHeader>
        <DetailedAmount destination={event.destination} amount={action.amount} />
        <DetailedActionTime destination={event.destination} timestamp={event.timestamp} />
      </DetailedInfoConatiner>
      <List>
        <AddressListItem
          // hideName={event.is_scam}
          destination={event.destination}
          recipient={action.recipient}
          sender={action.sender}
        />
        <ExtraListItem extra={event.extra} />
        {action.encrypted_comment && (
          <EncryptedComment
            layout={EncryptedCommentLayout.LIST_ITEM}
            encryptedComment={action.encrypted_comment}
            transactionType={ActionTypeEnum.TonTransfer}
            transactionId={event.event_id}
            sender={action.sender}
          />
        )}
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
