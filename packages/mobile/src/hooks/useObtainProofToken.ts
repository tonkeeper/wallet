import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '$store/wallet';
import TonWeb from 'tonweb';
import { createTonProofForTonkeeper } from '$utils/proof';
import * as SecureStore from 'expo-secure-store';
import { Configuration, WalletApi } from '@tonkeeper/core/src/legacy';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { tk } from '$wallet';
import { config } from '$config';

export function useObtainProofToken() {
  const wallet = useSelector(walletWalletSelector);
  const unlockVault = useUnlockVault();

  return useCallback(async () => {
    try {
      const proof_token = await SecureStore.getItemAsync('proof_token');
      if (proof_token) {
        return true;
      }
      const vault = await unlockVault();
      const address = await vault.getTonAddress(tk.wallet.isTestnet);
      let walletStateInit = '';
      if (wallet) {
        const tonWallet = wallet.vault.tonWallet;
        const { stateInit } = await tonWallet.createStateInit();
        walletStateInit = TonWeb.utils.bytesToBase64(await stateInit.toBoc(false));
      }
      const privateKey = await vault.getTonPrivateKey();
      const proof = await createTonProofForTonkeeper(
        address,
        privateKey,
        walletStateInit,
      );
      const walletApi = new WalletApi(
        new Configuration({
          basePath: config.get('tonapiV2Endpoint', tk.wallet.isTestnet),
          headers: {
            Authorization: `Bearer ${config.get('tonApiV2Key', tk.wallet.isTestnet)}`,
          },
        }),
      );
      const token = await walletApi.tonConnectProof({
        tonConnectProofRequest: proof,
      });
      await SecureStore.setItemAsync('proof_token', token.token, {
        requireAuthentication: false,
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }, [unlockVault, wallet]);
}
