import {
  AccountState,
  defaultAccountState,
} from '@tonkeeper/core-js/src/entries/account';
import { FiatCurrencies } from '@tonkeeper/core-js/src/entries/fiat';
import {
  AuthState,
  defaultAuthState,
} from '@tonkeeper/core-js/src/entries/password';
import { WalletState } from '@tonkeeper/core-js/src/entries/wallet';
import { Configuration } from '@tonkeeper/core-js/src/tonApi';
import {
  defaultTonendpointConfig,
  Tonendpoint,
  TonendpointConfig,
} from '@tonkeeper/core-js/src/tonkeeperApi/tonendpoint';
import React, { useContext } from 'react';

export const AppContext = React.createContext<{
  tonApi: Configuration;
  account: AccountState;
  auth: AuthState;
  fiat: FiatCurrencies;
  config: TonendpointConfig;
  tonendpoint: Tonendpoint;
}>({
  tonApi: new Configuration(),
  account: defaultAccountState,
  auth: defaultAuthState,
  fiat: FiatCurrencies.USD,
  config: defaultTonendpointConfig,
  tonendpoint: new Tonendpoint({}, {}),
});

export const useAppContext = () => {
  return useContext(AppContext);
};

export const WalletStateContext = React.createContext<WalletState>(undefined!);

export const useWalletContext = () => {
  return useContext(WalletStateContext);
};
