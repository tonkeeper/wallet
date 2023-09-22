import { tonDiamondCollectionAddress, telegramNumbersAddress } from '$shared/constants';
import { getChainName } from '$shared/dynamicConfig';
import { MarketplaceModel, TonDiamondMetadata } from '$store/models';
import { AccentKey } from '$styled';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import TonWeb from 'tonweb';
import { capitalizeFirstLetter } from './string';
import { NftItem } from '@tonkeeper/core';


const getTonDiamondsCollectionAddress = () => tonDiamondCollectionAddress[getChainName()];
const getTelegramNumbersCollectionAddress = () => telegramNumbersAddress[getChainName()];

export const checkIsTonDiamondsNFT = (
  nft: NftItem,
): nft is NftItem => {
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

export const checkIsTelegramNumbersNFT = (nft: NftItem): boolean => {
  if (!nft) {
    return false;
  }

  const collectionAddress = nft.collection?.address
    ? new TonWeb.utils.Address(nft.collection.address).toString(true, true, true)
    : '';

  return collectionAddress === getTelegramNumbersCollectionAddress();
};

export const useHasDiamondsOnBalance = () => {
  // const myNfts = useSelector(myNftsSelector);
  // const diamond = useMemo(() => {
  //   return Object.values(myNfts).find(checkIsTonDiamondsNFT);
  // }, [myNfts]);

  return false//!!diamond;
};

export const getDiamondsCollectionMarketUrl = (
  marketplace: MarketplaceModel,
  accentKey: AccentKey,
) => {
  const color = capitalizeFirstLetter(accentKey);

  const collectionAddress = getTonDiamondsCollectionAddress();

  switch (marketplace.id) {
    case 'getgems':
      return `${
        marketplace.marketplace_url
      }/collection/${collectionAddress}/?filter=${encodeURIComponent(
        JSON.stringify({ attributes: { Color: [color] } }),
      )}`;
    case 'tonDiamonds':
      return `${marketplace.marketplace_url}/collection/${collectionAddress}?traits[Color][0]=${color}`;
    default:
      return marketplace.marketplace_url;
  }
};
