import React, { FC, useState } from 'react';

import { useEvent, usePrepareDetailedAction } from '$hooks';
import { ActionProps } from './Action.interface';
import { ActionBase } from '$core/ModalContainer/Action/ActionBase/ActionBase';

export const ActionModal: FC<ActionProps> = ({ eventKey, action }) => {
  const event = useEvent(eventKey);
  const [cachedEvent] = useState(event);

  const actionProps = usePrepareDetailedAction(action, cachedEvent);

  return <ActionBase {...actionProps} />;
};
