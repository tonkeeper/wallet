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
import { isTestnetSelector } from '$store/main';
import { getDomainFromURL } from '$utils';
import { Address } from '@tonkeeper/core';

export interface ProgrammableButton {
  label?: string;
  style?: string;
  uri: string;
}

export interface ProgrammableButtonsProps {
  buttons: ProgrammableButton[];
  isApproved?: boolean;
  nftAddress: string;
}

const ProgrammableButtonsComponent = (props: ProgrammableButtonsProps) => {
  const wallet = useSelector(walletWalletSelector);
  const unlockVault = useUnlockVault();
  const isTestnet = useSelector(isTestnetSelector);

  const buttons = useMemo(() => {
    if (!props.buttons || !isArray(props.buttons)) {
      return [];
    }

    return props.buttons.slice(0, 5).filter((button) => button?.label && button?.uri);
  }, [props.buttons]);

  const openExternalLink = useCallback(
    async (uri: string) => {
      try {
        const nftAddress = Address.parse(props.nftAddress).toFriendly();
        const vault = await unlockVault();
        const address = await vault.getTonAddress(isTestnet);
        let walletStateInit = '';
        if (wallet) {
          const tonWallet = wallet.vault.tonWallet;
          const { stateInit } = await tonWallet.createStateInit();
          walletStateInit = TonWeb.utils.bytesToBase64(await stateInit.toBoc(false));
        }
        const privateKey = await vault.getTonPrivateKey();
        const publicKey = vault.tonPublicKey;
        const proof = await createTonProof({
          address,
          secretKey: privateKey,
          walletStateInit,
          payload: nftAddress,
          domain: getDomainFromURL(uri),
        });

        let url = new URL(uri);

        url.searchParams.append('wallet', Address.parse(proof.address).toFriendly());
        url.searchParams.append('nftAddress', nftAddress);
        url.searchParams.append('timestamp', proof.proof.timestamp.toString());
        url.searchParams.append('publicKey', TonWeb.utils.bytesToHex(publicKey));
        url.searchParams.append('signature', proof.proof.signature);

        openDAppBrowser(url.toString());
      } catch (e) {
        console.log(e);
      }
    },
    [isTestnet, props.nftAddress, unlockVault, wallet],
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

  return (
    <View style={styles.container}>
      {buttons.map((button) => (
        <View key={button.label} style={styles.buttonContainer}>
          <Button
            onPress={handleOpenLink(button.uri)}
            icon="ic-link-28"
            title={button.label}
            color={'secondary'}
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
