import React from 'react';
import { SecurityMigrationStack } from './SecurityMigrationStack/SecurityMigrationStack';
import { ResetPinStack } from './ResetPinStack/ResetPinStack';
import { createModalStackNavigator } from '$libs/navigation';
import { NFTSingleDeployModal } from '$core/ModalContainer/NFTOperations/Modals/NFTSingleDeployModal';
import { NFTTransferModal } from '$core/ModalContainer/NFTOperations/Modals/NFTTransferModal';
import { NFTSaleCancelModal } from '$core/ModalContainer/NFTOperations/Modals/NFTSaleCancelModal';
import { NFTSalePlaceGetgemsModal } from '$core/ModalContainer/NFTOperations/Modals/NFTSalePlaceGetgemsModal';
import { NFTSalePlaceModal } from '$core/ModalContainer/NFTOperations/Modals/NFTSalePlaceModal';
import { NFTItemDeployModal } from '$core/ModalContainer/NFTOperations/Modals/NFTItemDeployModal';
import { NFTCollectionDeployModal } from '$core/ModalContainer/NFTOperations/Modals/NFTCollectionDeployModal';
import { NFTTransferInputAddressModal } from '$core/ModalContainer/NFTTransferInputAddressModal/NFTTransferInputAddressModal';
import { NFT } from '$core/NFT/NFT';
import { SignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { AppStackRouteNames } from './navigationNames';
import { SetupWalletStack } from './SetupWalletStack/SetupWalletStack';
import {
  AccessConfirmation,
  BuyFiat,
  ChangePin,
  DAppBrowser,
  DAppsSearch,
  OldExchange,
  Migration,
  Receive,
  ScanQR,
  Send,
  StakingSend,
} from '$core';
import { WebView } from '$core/WebView/WebView';
import { NewConfirmSending } from '$core/ModalContainer/NewConfirmSending/NewConfirmSending';
import { ActionModal } from '$core/ModalContainer/Action/Action';
import { ExchangeModal } from '$modals/ExchangeModal';
import { Swap } from '$core/Swap/Swap';

const Stack = createModalStackNavigator();

export const ModalStack = React.memo(() => (
  <Stack.Navigator>
    <Stack.Group behavior="sheet">
      <Stack.Modal component={NFTSingleDeployModal} path="NFTSingleDeploy" />
      <Stack.Modal component={NFTTransferModal} path="NFTTransfer" />
      <Stack.Modal component={ActionModal} path="Action" />
      <Stack.Modal component={NFTCollectionDeployModal} path="NFTCollectionDeploy" />
      <Stack.Modal component={NFTItemDeployModal} path="NFTItemDeploy" />
      <Stack.Modal component={NFTSalePlaceModal} path="NFTSalePlace" />
      <Stack.Modal component={NFTSalePlaceGetgemsModal} path="NFTSalePlaceGetgems" />
      <Stack.Modal component={NFTSaleCancelModal} path="NFTSaleCancel" />
      <Stack.Modal component={ExchangeModal} path="Exchange" />
      <Stack.Modal component={OldExchange} path="OldExchange" />
      <Stack.Modal
        component={NFTTransferInputAddressModal}
        path="NFTTransferInputAddress"
      />
      <Stack.Modal component={SignRawModal} path="SignRaw" />
      <Stack.Modal component={NewConfirmSending} path="NewConfirmSending" />
    </Stack.Group>
    <Stack.Group behavior="modal">
      <Stack.Modal component={NFT} path="NFTItemDetails" />
      <Stack.Modal component={Receive} path={AppStackRouteNames.Receive} />
      <Stack.Modal component={Send} path={AppStackRouteNames.Send} />
      <Stack.Modal component={StakingSend} path={AppStackRouteNames.StakingSend} />
      <Stack.Modal component={ScanQR} path={AppStackRouteNames.ScanQR} />
      <Stack.Modal component={Swap} path={AppStackRouteNames.Swap} />
    </Stack.Group>
    <Stack.Group behavior="fullScreenModal">
      <Stack.Modal
        component={SetupWalletStack}
        path={AppStackRouteNames.SetupWalletStack}
      />
      <Stack.Modal
        options={{ gestureEnabled: false }}
        component={WebView}
        path={AppStackRouteNames.WebView}
      />
      <Stack.Modal
        options={{ gestureEnabled: false }}
        component={BuyFiat}
        path={AppStackRouteNames.BuyFiat}
      />
      <Stack.Modal component={DAppBrowser} path={AppStackRouteNames.DAppBrowser} />
    </Stack.Group>
    <Stack.Group behavior="fullScreenModal" animation="fade">
      <Stack.Modal
        component={SecurityMigrationStack}
        path={AppStackRouteNames.SecurityMigration}
      />
      <Stack.Modal component={ResetPinStack} path={AppStackRouteNames.ResetPin} />
      <Stack.Modal component={Migration} path={AppStackRouteNames.Migration} />
      <Stack.Modal
        component={AccessConfirmation}
        path={AppStackRouteNames.AccessConfirmation}
      />
      <Stack.Modal component={ChangePin} path={AppStackRouteNames.ChangePin} />
      <Stack.Modal component={DAppsSearch} path={AppStackRouteNames.DAppsSearch} />
    </Stack.Group>
  </Stack.Navigator>
));
