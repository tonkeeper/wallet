import React, { FC, useCallback } from 'react';
import * as S from './ImportWallet.style';
import { NavBar } from '$uikit';
import { useKeyboardHeight } from '$hooks/useKeyboardHeight';
import { ImportWalletForm } from '$shared/components';
import { RouteProp } from '@react-navigation/native';
import {
  ImportWalletStackParamList,
  ImportWalletStackRouteNames,
} from '$navigation/ImportWalletStack/types';
import { useNavigation } from '@tonkeeper/router';
import { useImportWallet } from '$hooks/useImportWallet';
import { tk } from '$wallet';

export const ImportWallet: FC<{
  route: RouteProp<ImportWalletStackParamList, ImportWalletStackRouteNames.ImportWallet>;
}> = (props) => {
  const keyboardHeight = useKeyboardHeight();
  const nav = useNavigation();
  const doImportWallet = useImportWallet();

  const isTestnet = !!props.route.params?.testnet;

  const handleWordsFilled = useCallback(
    async (mnemonic: string, lockupConfig: any, onEnd: () => void) => {
      try {
        const walletsInfo = await tk.getWalletsInfo(mnemonic, isTestnet);

        const shouldChooseWallets = !lockupConfig && walletsInfo.length > 1;

        if (shouldChooseWallets) {
          nav.navigate(ImportWalletStackRouteNames.ChooseWallets, {
            walletsInfo,
            mnemonic,
            lockupConfig,
            isTestnet,
          });
          onEnd();
          return;
        }

        const versions = walletsInfo.map((item) => item.version);

        await doImportWallet(mnemonic, lockupConfig, versions, isTestnet);
        onEnd();
      } catch {
        onEnd();
      }
    },
    [doImportWallet, isTestnet, nav],
  );

  return (
    <S.Wrap style={{ paddingBottom: keyboardHeight }}>
      <NavBar isTransparent />
      <ImportWalletForm onWordsFilled={handleWordsFilled} />
    </S.Wrap>
  );
};
