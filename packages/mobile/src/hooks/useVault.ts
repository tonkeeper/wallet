import { walletSelector } from "$store/wallet";
import { Vault } from "blockchain";
import { useSelector } from "react-redux";

export const useVault = (): Vault => {
  const { wallet } = useSelector(walletSelector);
  const vault = wallet?.vault;

  if (!vault) {
    throw new Error('No wallet');
  }

  return vault;
};
