import { CryptoCurrencies } from '$shared/constants';
import { NFTModel } from '$store/models';
import { NftItem } from '@tonkeeper/core/src/TonAPI';
import TonWeb from 'tonweb';
import { getFlag } from './flags';
import { Address } from '@tonkeeper/core';

export const mapNewNftToOldNftData = (
  nftItem: NftItem,
  walletFriendlyAddress,
): NFTModel => {
  const address = new TonWeb.utils.Address(nftItem.address).toString(true, true, true);
  const ownerAddress = nftItem.owner?.address
    ? Address.parse(nftItem.owner.address, {
        bounceable: !getFlag('address_style_nobounce'),
      }).toFriendly()
    : '';
  const name =
    typeof nftItem.metadata?.name === 'string'
      ? nftItem.metadata.name.trim()
      : nftItem.metadata?.name;

  const baseUrl = (nftItem.previews &&
    nftItem.previews.find((preview) => preview.resolution === '500x500')!.url)!;

  return {
    ...nftItem,
    ownerAddressToDisplay: nftItem.sale ? walletFriendlyAddress : undefined,
    trust: nftItem.trust,
    internalId: `${CryptoCurrencies.Ton}_${address}`,
    currency: CryptoCurrencies.Ton,
    provider: 'TonProvider',
    content: {
      image: {
        baseUrl,
      },
    },
    description: nftItem.metadata?.description,
    marketplaceURL: nftItem.metadata?.marketplace && nftItem.metadata?.external_url,
    attributes: nftItem.metadata?.attributes,
    address,
    name,
    ownerAddress,
    collection: nftItem.collection,
  };
};
