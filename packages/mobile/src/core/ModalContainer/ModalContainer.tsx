import React, { FC, useReducer, useEffect } from 'react';

import {
  ModalName,
  VisibilityReducer,
  ModalContainerProps,
} from './ModalContainer.interface';

import { ConfirmSending } from '$core/ModalContainer/ConfirmSending/ConfirmSending';
import { CreateSubscription } from '$core/ModalContainer/CreateSubscription/CreateSubscription';
import { DeployModal } from './NFTOperations/Modals/DeployModal';
import { AddEditFavoriteAddress } from './AddEditFavoriteAddress/AddEditFavoriteAddress';

const INITIAL_VISIBILITY = Object.values(ModalName).reduce(
  (acc, cur) => ({ ...acc, [cur]: false }),
  {} as Record<ModalName, boolean>,
);

export const ModalContainer: FC<ModalContainerProps> = (props) => {
  const [visibility, dispatch] = useReducer<VisibilityReducer>(
    (state, name) => ({
      ...state,
      [name]: !state[name],
    }),
    INITIAL_VISIBILITY,
  );

  const { route } = props;
  const { modalName } = route.params;

  useEffect(() => {
    if (modalName) {
      dispatch(modalName);
    }
  }, [dispatch, modalName]);

  return (
    <>
      {visibility[ModalName.CONFIRM_SENDING] && (
        <ConfirmSending {...props} {...route.params} />
      )}
      {visibility[ModalName.DEPLOY] && <DeployModal {...props} {...route.params} />}
      {visibility[ModalName.CREATE_SUBSCRIPTION] && (
        <CreateSubscription {...props} {...route.params} />
      )}
      {visibility[ModalName.SUBSCRIPTION] && (
        <CreateSubscription {...props} {...route.params} isEdit />
      )}
      {visibility[ModalName.ADD_EDIT_FAVORITE_ADDRESS] && (
        <AddEditFavoriteAddress {...props} {...route.params} />
      )}
    </>
  );
};
