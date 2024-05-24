import React, { useCallback } from 'react';
import { View } from '$uikit';
import { Steezy } from '$styles';
import { memo, useMemo } from 'react';
import { isArray } from 'lodash';
import { Button } from '@tonkeeper/uikit';
import { openDAppBrowser } from '$navigation';
import { Alert } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';
import TonWeb from 'tonweb';
import { createTonProof } from '$utils/proof';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '$store/wallet';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { getDomainFromURL } from '$utils';
import { Address } from '@tonkeeper/core';
import { tk } from '$wallet';

export interface ProgrammableButton {
  label?: string;
  style?: string;
  uri: string;
}

export interface ProgrammableButtonsProps {
  buttons: ProgrammableButton[];
  isApproved?: boolean;
  nftAddress: string;
  disabled?: boolean;
}

const ProgrammableButtonsComponent = (props: ProgrammableButtonsProps) => {
  const wallet = useSelector(walletWalletSelector);
  const unlockVault = useUnlockVault();

  const buttons = useMemo(() => {
    if (!props.buttons || !isArray(props.buttons)) {
      return [];
    }

    return props.buttons.slice(0, 5).filter((button) => button?.label && button?.uri);
  }, [props.buttons]);

  const openExternalLink = useCallback(
    async (uri: string) => {
      try {
        const nftAddress = Address.parse(props.nftAddress).toRaw();
        const vault = await unlockVault();
        const address = await vault.getTonAddress(tk.wallet.isTestnet);
        let walletStateInit = '';
        if (wallet) {
          const tonWallet = wallet.vault.tonWallet;
          const { stateInit } = await tonWallet.createStateInit();
          walletStateInit = TonWeb.utils.bytesToBase64(await stateInit.toBoc(false));
        }
        const privateKey = await vault.getTonPrivateKey();
        const publicKey = vault.tonPublicKey;
        const domain = getDomainFromURL(uri);
        const proof = await createTonProof({
          address,
          secretKey: privateKey,
          walletStateInit,
          payload: nftAddress,
          domain,
        });

        let url = new URL(uri);

        const buffer = Buffer.from(proof.proof.signature, 'base64');
        const signatureHex = buffer.toString('hex');

        url.searchParams.append('wallet', Address.parse(proof.address).toRaw());
        url.searchParams.append('nftAddress', nftAddress);
        url.searchParams.append('timestamp', proof.proof.timestamp.toString());
        url.searchParams.append('domain', domain);
        url.searchParams.append('publicKey', TonWeb.utils.bytesToHex(publicKey));
        url.searchParams.append('signature', signatureHex);
        url.searchParams.append('stateInit', proof.proof.stateInit);

        openDAppBrowser(url.toString());
      } catch (e) {
        console.log(e);
      }
    },
    [props.nftAddress, unlockVault, wallet],
  );

  const handleOpenLink = useCallback(
    (uri: string) => () => {
      if (props.isApproved) {
        openExternalLink(uri);
      } else {
        Alert.alert(
          t('programmable_nfts.alert.title'),
          t('programmable_nfts.alert.description', { uri }),
          [
            {
              text: t('programmable_nfts.alert.open'),
              onPress: () => openExternalLink(uri),
              style: 'destructive',
            },
            {
              text: t('programmable_nfts.alert.cancel'),
              style: 'cancel',
            },
          ],
        );
      }
    },
    [openExternalLink, props.isApproved],
  );

  if (!props.isApproved) {
    return null;
  }

  return (
    <View style={styles.container}>
      {buttons.map((button, idx) => (
        <View key={button.label} style={styles.buttonContainer}>
          <Button
            disabled={props.disabled}
            onPress={handleOpenLink(button.uri)}
            icon="ic-link-28"
            title={button.label}
            color={idx === 0 ? 'green' : 'secondary'}
          />
        </View>
      ))}
    </View>
  );
};

export const ProgrammableButtons = memo(ProgrammableButtonsComponent);

const styles = Steezy.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 16,
  },
});
