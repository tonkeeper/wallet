import React, { FC } from 'react';

import { usePrepareDetailedAction } from '$hooks';
import { ActionProps } from './Action.interface';
import { ActionBase } from '$core/ModalContainer/Action/ActionBase/ActionBase';

export const ActionModal: FC<ActionProps> = ({ event, action }) => {
  const actionProps = usePrepareDetailedAction(action, event);

  console.log(actionProps);

  return <ActionBase {...actionProps} />;
};
