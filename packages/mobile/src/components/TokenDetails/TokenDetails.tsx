import React, { memo } from 'react';
import { Button, Modal, Steezy, View } from '@tonkeeper/uikit';
import { Jetton, NftItem } from 'tonapi-sdk-js';
import { JettonDetails } from './components/JettonDetails';
import { NFTDetails } from './components/NFTDetails';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ModalStackRouteNames } from '$navigation';
import { ModalStackParamList } from '$navigation/ModalStack.interface';

export interface TokenDetailsParams {
  nft?: NftItem | string;
  jetton?: Jetton;
}

export const TokenDetails = memo(() => {
  const route =
    useRoute<RouteProp<ModalStackParamList, ModalStackRouteNames.TokenDetails>>();

  return (
    <Modal>
      <Modal.Header title={'Token details'} />
      <Modal.Content>
        {route.params.jetton && <JettonDetails jetton={route.params.jetton} />}
        {route.params.nft && <NFTDetails nft={route.params.nft} />}
      </Modal.Content>
      <Modal.Footer>
        <View style={styles.footerContainer}>
          <Button
            color="secondary"
            onPress={() => console.log(true)}
            title="View on Tonviewer"
          />
        </View>
      </Modal.Footer>
    </Modal>
  );
});

const styles = Steezy.create({
  footerContainer: {
    paddingHorizontal: 16,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  square: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});
