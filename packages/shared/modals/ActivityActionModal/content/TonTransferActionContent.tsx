import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { List, TonIcon, copyText } from '@tonkeeper/uikit';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { ActionModalContent } from '../ActionModalContent';
import { t } from '../../../i18n';

interface TonTransferActionContentProps {
  action: ActionItem<ActionType.TonTransfer>;
}

export const TonTransferActionContent = (props: TonTransferActionContentProps) => {
  const { action } = props;

  return (
    <ActionModalContent header={<TonIcon size="large" />} action={action}>
      <List>
        <AddressListItem
          recipient={action.payload.recipient}
          destination={action.destination}
          hideName={action.event.is_scam}
          sender={action.payload.sender}
          bounceable={action.initialActionType === ActionType.SmartContractExec}
        />
        <ExtraListItem extra={action.event.extra} />
        {/* {action.encrypted_comment && (
      <EncryptedComment
        layout={EncryptedCommentLayout.LIST_ITEM}
        encryptedComment={action.encrypted_comment}
        transactionType={TransactionActionType.TonTransfer}
        transactionId={event.event_id}
        sender={action.sender}
      />
    )} */}
        {!!action.payload.comment && (
          <List.Item
            titleType="secondary"
            title={t('transactionDetails.comment')}
            onPress={copyText(action.payload.comment)}
            value={action.payload.comment}
            valueMultiline
          />
        )}
      </List>
    </ActionModalContent>
  );
};
