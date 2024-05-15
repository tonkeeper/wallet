import React, { memo, useEffect } from 'react';
import { createModalStackNavigator } from '@tonkeeper/router';
import { NFT } from '$core/NFT/NFT';
import { SignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { AppStackRouteNames, ModalStackRouteNames } from './navigationNames';
import {
  AccessConfirmation,
  BuyFiat,
  DAppBrowser,
  DAppsSearch,
  OldExchange,
  ScanQR,
  Send,
  StakingSend,
} from '$core';
import { WebView } from '$core/WebView/WebView';
import { NewConfirmSending } from '$core/ModalContainer/NewConfirmSending/NewConfirmSending';
import { RenewAllDomainModal } from '../tabs/Wallet/RenewAllDomainModal';
import { СonfirmRenewAllDomains } from '../tabs/Wallet/components/СonfirmRenewAllDomains';

import { Swap } from '$core/Swap/Swap';
import { ChooseCountry } from '$core/ChooseCountry/ChooseCountry';

import { SwitchWalletModal } from '@tonkeeper/shared/modals/SwitchWalletModal';
import { AddWalletModal } from '@tonkeeper/shared/modals/AddWalletModal';
import { ProvidersWithNavigation } from './Providers';
import { ReceiveModal } from '@tonkeeper/shared/modals/ReceiveModal';
import { ReceiveJettonModal } from '@tonkeeper/shared/modals/ReceiveJettonModal';
import { EditAppConfigModal } from '$core/DevMenu/DevConfigScreen';
import { RefillBatteryModal } from '../../../shared/modals/RefillBatteryModal';
import { NFTSend } from '$core/NFTSend/NFTSend';
import { ReceiveInscriptionModal } from '@tonkeeper/shared/modals/ReceiveInscriptionModal';
import { CustomizeWallet } from '$core/CustomizeWallet/CustomizeWallet';
import { TokenDetails } from '../components/TokenDetails/TokenDetails';
import {
  BackupWarningModal,
  BurnVouchersModal,
  ExchangeModal,
  LogoutWarningModal,
  PairLedgerModal,
} from '$modals';
import { ThemeProvider, useTheme } from '@tonkeeper/uikit';
import { BlueTheme } from '@tonkeeper/uikit/src/styles/themes/blue';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { RechargeByPromoModal } from '@tonkeeper/shared/modals/ActivityActionModal/RechargeByPromoModal';
import { BatterySend } from '$core/BatterySend';
import { SignerConfirmScreen } from '../screens';

const Stack = createModalStackNavigator(ProvidersWithNavigation);

const SwapWithTheme = memo(() => {
  const theme = useTheme();

  useEffect(() => {
    SystemNavigationBar.setNavigationColor(
      BlueTheme.backgroundPageAlternate,
      'light',
      'navigation',
    );

    return () => {
      SystemNavigationBar.setNavigationColor(
        theme.backgroundPageAlternate,
        theme.isDark ? 'light' : 'dark',
        'navigation',
      );
    };
  }, [theme.backgroundPageAlternate, theme.isDark]);

  return (
    <ThemeProvider theme={BlueTheme}>
      <Swap />
    </ThemeProvider>
  );
});

export const ModalStack = React.memo(() => (
  <Stack.Navigator>
    <Stack.Group behavior="sheet">
      <Stack.Modal component={ExchangeModal} path="Exchange" />
      <Stack.Modal component={OldExchange} path="OldExchange" />
      <Stack.Modal component={СonfirmRenewAllDomains} path="СonfirmRenewAllDomains" />
      <Stack.Modal component={EditAppConfigModal} path="/dev/config/edit" />
      <Stack.Modal component={SignRawModal} path="SignRaw" />
      <Stack.Modal component={NewConfirmSending} path="NewConfirmSending" />
      <Stack.Modal component={SwitchWalletModal} path="/switch-wallet" />
      <Stack.Modal component={AddWalletModal} path="/add-wallet" />
      <Stack.Modal component={TokenDetails} path={ModalStackRouteNames.TokenDetails} />
      <Stack.Modal component={RefillBatteryModal} path="/refill-battery" />
      <Stack.Modal component={BackupWarningModal} path="/backup-warning" />
      <Stack.Modal component={LogoutWarningModal} path="/logout-warning" />
      <Stack.Modal component={RechargeByPromoModal} path="/recharge-by-promo" />
      <Stack.Modal component={PairLedgerModal} path="/pair-ledger" />
      <Stack.Modal component={BurnVouchersModal} path="/burn-vouchers" />
    </Stack.Group>
    <Stack.Group behavior="modal">
      <Stack.Modal component={ReceiveModal} path="ReceiveModal" />
      <Stack.Modal component={ReceiveJettonModal} path="/receive/jetton/" />
      <Stack.Modal
        component={ReceiveInscriptionModal}
        path={AppStackRouteNames.ReceiveInscription}
      />
      <Stack.Modal component={NFT} path="NFTItemDetails" />
      <Stack.Modal
        component={RefillBatteryModal}
        path={AppStackRouteNames.RefillBattery}
      />
      {/* <Stack.Modal component={Receive} path={AppStackRouteNames.Receive} /> */}
      <Stack.Modal component={Send} path={AppStackRouteNames.Send} />
      <Stack.Modal component={RenewAllDomainModal} path="RenewAllDomains" />
      <Stack.Modal component={ChooseCountry} path={AppStackRouteNames.ChooseCountry} />
      <Stack.Modal component={StakingSend} path={AppStackRouteNames.StakingSend} />
      <Stack.Modal component={NFTSend} path={AppStackRouteNames.NFTSend} />
      <Stack.Modal component={BatterySend} path={AppStackRouteNames.BatterySend} />
      <Stack.Modal component={ScanQR} path={AppStackRouteNames.ScanQR} />
      <Stack.Modal component={SwapWithTheme} path={AppStackRouteNames.Swap} />
      <Stack.Modal
        component={CustomizeWallet}
        path={AppStackRouteNames.CustomizeWallet}
      />
      <Stack.Modal component={SignerConfirmScreen} path="/signer-confirm" />
    </Stack.Group>
    <Stack.Group behavior="fullScreenModal">
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
        component={AccessConfirmation}
        path={AppStackRouteNames.AccessConfirmation}
      />
      <Stack.Modal component={DAppsSearch} path={AppStackRouteNames.DAppsSearch} />
    </Stack.Group>
  </Stack.Navigator>
));
