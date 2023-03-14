import { nftsSelector } from "$store/nfts";
import { useSelector } from "react-redux";

export const useNFTs = () => {
  const { myNfts } = useSelector(nftsSelector);

  const nfts = Object.values(myNfts).map((item) => {
    return item;
  });

  return nfts;
};