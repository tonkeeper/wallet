import React, { FC, useCallback } from 'react';
import { usePrepareAction } from '$hooks';
import { ActionItemProps } from './ActionItem.interface';
import { ActionItemBase } from '$shared/components/ActionItem/ActionItemBase/ActionItemBase';
import { useNavigation } from '$libs/navigation';

export const ActionItem: FC<ActionItemProps> = (props) => {
  const { event, borderStart = true, borderEnd = true, action } = props;
  const nav = useNavigation();

  const preparedAction = usePrepareAction(action, event);

  const handleOpen = useCallback(() => {
    if (props.action.type !== 'Unknown') {
      nav.openModal('Action', { event: props.event, action: props.action });
    }
  }, [nav, props.action, props.event]);

  return (
    <ActionItemBase
      borderStart={borderStart}
      borderEnd={borderEnd}
      {...preparedAction}
      handleOpenAction={handleOpen}
    />
  );
};
