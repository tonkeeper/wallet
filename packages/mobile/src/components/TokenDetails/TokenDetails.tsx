import React, { memo, useCallback } from 'react';
import { Button, Modal, Steezy, View } from '@tonkeeper/uikit';
import { JettonDetails } from './components/JettonDetails';
import { NFTDetails } from './components/NFTDetails';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ModalStackRouteNames } from '$navigation';
import { ModalStackParamList } from '$navigation/ModalStack.interface';
import { Linking } from 'react-native';
import { config } from '$config';
import { t } from '@tonkeeper/shared/i18n';

export const TokenDetails = memo(() => {
  const route =
    useRoute<RouteProp<ModalStackParamList, ModalStackRouteNames.TokenDetails>>();
  const params = route.params.params;
  const handleOpenOnTonviewer = useCallback(() => {
    const address: string | undefined =
      params.jetton?.address || typeof params.nft === 'string'
        ? (params.nft as string)
        : params.nft?.address;

    if (!address) {
      return null;
    }
    Linking.openURL(config.get('accountExplorer').replace('%s', address));
  }, [params.jetton?.address, params.nft]);

  return (
    <Modal>
      <Modal.Header title={t('tokenDetails.title')} />
      <Modal.Content>
        {route.params.params.jetton && (
          <JettonDetails jetton={route.params.params.jetton} />
        )}
        {route.params.params.nft && <NFTDetails nft={route.params.params.nft} />}
      </Modal.Content>
      <Modal.Footer>
        <View style={styles.footerContainer}>
          <Button
            color="secondary"
            onPress={handleOpenOnTonviewer}
            title={t('tokenDetails.tonviewer_button')}
          />
        </View>
      </Modal.Footer>
    </Modal>
  );
});

const styles = Steezy.create({
  footerContainer: {
    padding: 16,
  },
});
