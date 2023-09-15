import { memo } from 'react';
import { ActionListItem } from '../ActionListItem';
import { ActionItem, ActionType } from '@tonkeeper/core';

interface UnSubscribeActionListItemProps {
  action: ActionItem<ActionType.UnSubscribe>;
}

export const UnSubscribeActionListItem = memo<UnSubscribeActionListItemProps>((props) => {
  const { action } = props;

  return <ActionListItem action={action} />;
});
