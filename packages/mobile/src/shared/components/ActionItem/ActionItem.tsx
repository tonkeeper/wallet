import React, { FC, useCallback } from 'react';
import { useEvent, usePrepareAction } from '$hooks';
import { ActionItemProps } from './ActionItem.interface';
import { ActionItemBase } from '$shared/components/ActionItem/ActionItemBase/ActionItemBase';
import { useNavigation } from '$libs/navigation';

export const ActionItem: FC<ActionItemProps> = (props) => {
  const { eventKey, borderStart = true, borderEnd = true, action } = props;
  const nav = useNavigation();

  const event = useEvent(eventKey);
  const preparedAction = usePrepareAction(action, event);

  const handleOpen = useCallback(() => {
    if (props.action.type !== 'Unknown') {
      nav.openModal('Action', { eventKey: props.eventKey, action: props.action });
    }
  }, [props.action, props.eventKey]);

  return (
    <ActionItemBase
      borderStart={borderStart}
      borderEnd={borderEnd}
      {...preparedAction}
      handleOpenAction={handleOpen}
    />
  );
};
