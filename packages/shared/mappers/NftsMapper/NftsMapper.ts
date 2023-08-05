import { NftItem, NftItems } from '@tonkeeper/core/src/TonAPI';
import { t } from '../../i18n';
import { Address } from '@tonkeeper/core';

export function NftsMapper(items: NftItem[]) {}

type NftMapperInput = {
  nft: NftItem;
};

export function NftMapper(input: NftMapperInput) {
  const nft = {};

  const isUsername = input.nft.dns?.endsWith('.t.me');
  const isDNS = !!input.nft.dns && !isUsername;
  const name =
    (isDNS && input.nft.dns) ||
    input.nft.metadata.name ||
    Address.maskify(input.nft.address);

  const collectionName = isDNS
    ? 'TON DNS'
    : input.nft?.collection
    ? input.nft.collection.name
    : t('nft_single_nft');
}
