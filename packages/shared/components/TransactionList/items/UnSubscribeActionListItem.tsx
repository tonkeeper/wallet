import { memo } from 'react';
import { ActionListItem } from '../ActionListItem';
import { TransactionEvent, UnSubscribeActionData } from '@tonkeeper/core';

interface UnSubscribeActionListItemProps {
  action: UnSubscribeActionData;
  event: TransactionEvent;
}

export const UnSubscribeActionListItem = memo<UnSubscribeActionListItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} action={action} />;
});
