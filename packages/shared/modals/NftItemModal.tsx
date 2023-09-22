import { NftItem } from '@tonkeeper/core';
import { memo, useCallback } from 'react';
import { tk } from '../tonkeeper';
import { navigation } from '@tonkeeper/router';
import { useTonkeeper } from '../hooks/useTonkeeper';
import { Address } from '../Address';
import { t } from '../i18n';
import {
  InlineButton,
  List,
  Modal,
  Picture,
  Steezy,
  Toast,
  View,
  copyText,
} from '@tonkeeper/uikit';

export async function openNftItemModal(nftAddress: string) {
  try {
    const loadedNftItem = tk.wallet.nfts.getLoadedItem(nftAddress);
    if (loadedNftItem) {
      navigation.push('/nft/', { nftItem: loadedNftItem });
    } else {
      Toast.loading();
      const nftItem = await tk.wallet.nfts.loadItem(nftAddress);
      navigation.push('/nft/', { nftItem });
      Toast.hide();
    }
  } catch (err) {
    console.log(err);
    Toast.fail('Error load nft');
  }
}

interface NftItemModalProps {
  nftItem: NftItem;
}

export const NftItemModal = memo<NftItemModalProps>((props) => {
  const { nftItem } = props;
  const ishiddenBalances = useTonkeeper((state) => state.hiddenBalances);

  const viewInExplorer = useCallback(() => {
    // openDAppBrowser(getServerConfig('NFTOnExplorerUrl').replace('%s', contractAddress));
  }, []);

  return (
    <Modal>
      <Modal.Header title={ishiddenBalances ? '* * * *' : nftItem.name} />
      <Modal.ScrollView>
        {/* <View >
          <Picture 

          />
        </View> */}
        <List.Header
          title={t('nftItemModal.details')}
          rightContent={
            <InlineButton
              title={t('nftItemModal.view_in_explorer')}
              onPress={viewInExplorer}
            />
          }
        />
        <List>
          {nftItem.owner ? (
            <List.Item
              value={Address.parse(nftItem.owner.address).toShort()}
              label={t('nftItemModal.owner')}
              onPress={copyText(
                Address.parse(nftItem.owner.address).toFriendly(),
                t('address_copied'),
              )}
            />
          ) : (
            <List.Item label={t('nftItemModal.owner')} value="..." />
          )}
          <List.Item
            onPress={copyText(
              Address.parse(nftItem.address).toFriendly(),
              t('address_copied'),
            )}
            value={Address.parse(nftItem.address).toShort()}
            label={t('nftItemModal.contract_address')}
          />
        </List>
      </Modal.ScrollView>
    </Modal>
  );
});

const styles = Steezy.create({
  container: {},
});
