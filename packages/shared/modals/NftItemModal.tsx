import { Modal, Steezy } from '@tonkeeper/uikit';
import { NftItem } from '@tonkeeper/core';
import { memo } from 'react';


export async function openNftItemModal(nftAddress: string) {
  return;
  // try {
  //   const loadedNftItem = tk.wallet.nfts.getLoadedItem(nftAddress);
  //   if (loadedNftItem) {
  //     navigation.push('/nft/', { nftItem: loadedNftItem });
  //   } else {
  //     Toast.loading();
  //     const nftItem = await tk.wallet.nfts.loadItem(nftAddress);
  //     navigation.push('/nft/', { nftItem });
  //     Toast.hide();
  //   }
  // } catch (err) {
  //   console.log(err);
  //   Toast.fail('Error load nft');
  // }
}

interface NftItemModalProps {
  nftItem: NftItem;
}

export const NftItemModal = memo<NftItemModalProps>((props) => {
  return (
    <Modal>
      <Modal.Header />
      <Modal.ScrollView></Modal.ScrollView>
    </Modal>
  );
});

const styles = Steezy.create({
  container: {},
});
