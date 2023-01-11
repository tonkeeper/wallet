import React, { FC, useReducer, useEffect } from 'react';

import {
  ModalName,
  VisibilityReducer,
  ModalContainerProps,
} from './ModalContainer.interface';
import { EditCoins } from './EditCoins/EditCoins';
import { RequireWallet } from './RequireWallet/RequireWallet';
import { ConfirmSending } from '$core/ModalContainer/ConfirmSending/ConfirmSending';
import { ExchangeMethod } from '$core/ModalContainer/ExchangeMethod/ExchangeMethod';
import { CreateSubscription } from '$core/ModalContainer/CreateSubscription/CreateSubscription';
import { TonConnectModal } from '$core/TonConnect/TonConnectModal';
import { Exchange } from '$core/Exchange/Exchange';
import { InfoAboutInactive } from '$core/ModalContainer/InfoAboutInactive/InfoAboutInactive';
import { DeployModal } from './NFTOperations/Modals/DeployModal';
import { ReminderEnableNotificationsModal } from './ReminderEnableNotificationsModal';
import { AppearanceBottomSheet } from './AppearanceBottomSheet';
import { Marketplaces } from '$core/ModalContainer/Marketplaces/Marketplaces';
import { AddEditFavoriteAddress } from './AddEditFavoriteAddress/AddEditFavoriteAddress';
import { LinkingDomainModal } from './LinkingDomainModal';
import { ReplaceDomainAddressModal } from './NFTOperations/ReplaceDomainAddressModal';

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
      {visibility[ModalName.EDIT_COINS] && <EditCoins {...props} {...route.params} />}
      {visibility[ModalName.REQUIRE_WALLET] && (
        <RequireWallet {...props} {...route.params} />
      )}
      {visibility[ModalName.CONFIRM_SENDING] && (
        <ConfirmSending {...props} {...route.params} />
      )}
      {visibility[ModalName.DEPLOY] && <DeployModal {...props} {...route.params} />}
      {visibility[ModalName.EXCHANGE_METHOD] && (
        <ExchangeMethod {...props} {...route.params} />
      )}
      {visibility[ModalName.CREATE_SUBSCRIPTION] && (
        <CreateSubscription {...props} {...route.params} />
      )}
      {visibility[ModalName.SUBSCRIPTION] && (
        <CreateSubscription {...props} {...route.params} isEdit />
      )}
      {visibility[ModalName.INFO_ABOUT_INACTIVE] && (
        <InfoAboutInactive {...props} {...route.params} />
      )}
      {visibility[ModalName.REMINDER_ENABLE_NOTIFICATIONS] && (
        <ReminderEnableNotificationsModal {...props} {...route.params} />
      )}
      {visibility[ModalName.APPEARANCE] && (
        <AppearanceBottomSheet {...props} {...route.params} />
      )}
      {visibility[ModalName.MARKETPLACES] && (
        <Marketplaces {...props} {...route.params} />
      )}
      {visibility[ModalName.ADD_EDIT_FAVORITE_ADDRESS] && (
        <AddEditFavoriteAddress {...props} {...route.params} />
      )}
      {visibility[ModalName.LINKING_DOMAIN] && (
        <LinkingDomainModal {...props} {...route.params} />
      )}
      {visibility[ModalName.REPLACE_DOMAIN_ADDRESS] && (
        <ReplaceDomainAddressModal {...props} {...route.params} />
      )}
    </>
  );
};
