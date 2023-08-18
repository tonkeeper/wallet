import { CustomAccountEvent, CustomTonTransferAction } from '@tonkeeper/core/src/TonAPI';
import { formatter } from '../../../formatter';
import { Steezy } from '@tonkeeper/uikit';
import { memo, useMemo } from 'react';

import { ActionListItem } from '../ActionListItem';
import { CommentBubble } from '../components/MessageBubble';

interface TonTransferItemProps {
  action: CustomTonTransferAction;
  event: CustomAccountEvent;
}

export const TonTransferItem = memo<TonTransferItemProps>((props) => {
  const { action, event } = props;

  const amount = useMemo(() => {
    return formatter.formatNano(action.amount, {
      prefix: '+', //amountPrefix,
      postfix: 'TON',
    });
  }, []);

  return (
    <ActionListItem status={action.status} event={event}>
      {!!action.comment && <CommentBubble text={action.comment.trim()} />}
      {/* {!!action.encrypted_comment && (
        <EncryptedComment
          sender={action.sender}
          transactionId={event.event_id}
          transactionType={action.type}
          layout={EncryptedCommentLayout.BUBBLE}
          encryptedComment={action.encrypted_comment}
        />
      )} */}
    </ActionListItem>
  );
});
