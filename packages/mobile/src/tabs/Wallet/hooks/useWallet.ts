import { walletWalletSelector } from "$store/wallet";
import { useSelector } from "react-redux";

export const useWallet = () => {
  const wallet = useSelector(walletWalletSelector);

  if (wallet && wallet.address) {
    return { address: wallet.address };
  }

  return null;
};
