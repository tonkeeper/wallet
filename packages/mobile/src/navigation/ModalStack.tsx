import React from 'react';
import { SecurityMigrationStack } from './SecurityMigrationStack/SecurityMigrationStack';
import { ResetPinStack } from './ResetPinStack/ResetPinStack';
import { createModalStackNavigator } from '@tonkeeper/router';
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
  ScanQR,
  Send,
  StakingSend,
} from '$core';
import { WebView } from '$core/WebView/WebView';
import { NewConfirmSending } from '$core/ModalContainer/NewConfirmSending/NewConfirmSending';
import { RenewAllDomainModal } from '../tabs/Wallet/RenewAllDomainModal';
import { СonfirmRenewAllDomains } from '../tabs/Wallet/components/СonfirmRenewAllDomains';

import { ExchangeModal } from '$modals/ExchangeModal';
import { Swap } from '$core/Swap/Swap';
import { ChooseCountry } from '$core/ChooseCountry/ChooseCountry';

import { SwitchWalletModal } from '@tonkeeper/shared/modals/SwitchWalletModal';
import { AddWalletModal } from '@tonkeeper/shared/modals/AddWalletModal';
import { ProvidersWithNavigation } from './Providers';
import { ReceiveModal } from '@tonkeeper/shared/modals/ReceiveModal';
import { ReceiveJettonModal } from '@tonkeeper/shared/modals/ReceiveJettonModal';
import { EditAppConfigModal } from '$core/DevMenu/DevConfigScreen';
import { ReceiveInscriptionModal } from '@tonkeeper/shared/modals/ReceiveInscriptionModal';

const Stack = createModalStackNavigator(ProvidersWithNavigation);

export const ModalStack = React.memo(() => (
  <Stack.Navigator>
    <Stack.Group behavior="sheet">
      <Stack.Modal component={ExchangeModal} path="Exchange" />
      <Stack.Modal component={OldExchange} path="OldExchange" />
      <Stack.Modal component={СonfirmRenewAllDomains} path="СonfirmRenewAllDomains" />
      <Stack.Modal
        component={NFTTransferInputAddressModal}
        path="NFTTransferInputAddress"
      />
      <Stack.Modal component={EditAppConfigModal} path="/dev/config/edit" />
      <Stack.Modal component={SignRawModal} path="SignRaw" />
      <Stack.Modal component={NewConfirmSending} path="NewConfirmSending" />
      <Stack.Modal component={SwitchWalletModal} path="/switch-wallet" />
      <Stack.Modal component={AddWalletModal} path="/add-wallet" />
    </Stack.Group>
    <Stack.Group behavior="modal">
      <Stack.Modal component={ReceiveModal} path="ReceiveModal" />
      <Stack.Modal component={ReceiveJettonModal} path="/receive/jetton/" />
      <Stack.Modal
        component={ReceiveInscriptionModal}
        path={AppStackRouteNames.ReceiveInscription}
      />
      <Stack.Modal component={NFT} path="NFTItemDetails" />
      <Stack.Modal component={Send} path={AppStackRouteNames.Send} />
      <Stack.Modal component={RenewAllDomainModal} path="RenewAllDomains" />
      <Stack.Modal component={ChooseCountry} path={AppStackRouteNames.ChooseCountry} />
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
