import React, { FC, useCallback } from 'react';
import { useEvent, usePrepareAction } from '$hooks';
import { ActionItemProps } from './ActionItem.interface';
import { ActionItemBase } from '$shared/components/ActionItem/ActionItemBase/ActionItemBase';
import { openAction } from '$navigation';
import { ActionTypeEnum } from 'tonapi-sdk-js';

export const ActionItem: FC<ActionItemProps> = (props) => {
  const { eventKey, borderStart = true, borderEnd = true, action } = props;

  const event = useEvent(eventKey);
  const preparedAction = usePrepareAction(action, event);

  const handleOpen = useCallback(() => {
    if (
      Object.values(ActionTypeEnum).includes(props.action.type) &&
      props.action.type !== 'Unknown'
    ) {
      openAction(props.eventKey, props.action);
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
