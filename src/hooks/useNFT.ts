import { NFTKeyPair } from '$store/nfts/interface';
import { NFTModel } from '$store/models';
import { useDispatch, useSelector } from 'react-redux';
import { nftsActions, nftsSelector } from '$store/nfts';
import { useEffect } from 'react';

export function useNFT(key: NFTKeyPair): NFTModel {
  const { myNfts, nfts } = useSelector(nftsSelector);
  const dispatch = useDispatch();

  const nft =
    nfts[`${key.currency}_${key.address}`] || myNfts[`${key.currency}_${key.address}`];

  useEffect(() => {
    if (!nft) {
      dispatch(nftsActions.loadNFT({ address: key.address }));
    }
  }, [nft, dispatch, key.address]);

  return nft;
}
