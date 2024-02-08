import { tonDiamondCollectionAddress, telegramNumbersAddress } from '$shared/constants';
import { getChainName } from '$shared/dynamicConfig';
import { NFTModel, TonDiamondMetadata } from '$store/models';
import TonWeb from 'tonweb';

const getTonDiamondsCollectionAddress = () => tonDiamondCollectionAddress[getChainName()];
const getTelegramNumbersCollectionAddress = () => telegramNumbersAddress[getChainName()];

export const checkIsTonDiamondsNFT = (
  nft: NFTModel,
): nft is NFTModel<TonDiamondMetadata> => {
  if (!nft) {
    return false;
  }

  const collectionAddress = nft.collection?.address
    ? new TonWeb.utils.Address(nft.collection.address).toString(true, true, true)
    : '';

  return (
    collectionAddress === getTonDiamondsCollectionAddress() &&
    Boolean((nft.metadata as TonDiamondMetadata)?.theme?.main)
  );
};

export const checkIsTelegramNumbersNFT = (nft: NFTModel): boolean => {
  if (!nft) {
    return false;
  }

  const collectionAddress = nft.collection?.address
    ? new TonWeb.utils.Address(nft.collection.address).toString(true, true, true)
    : '';

  return collectionAddress === getTelegramNumbersCollectionAddress();
};
