import React from 'react';
import { walletSelector } from '$store/wallet';
import { useSelector } from 'react-redux';

export const useAllAddresses = () => {
  const { wallet } = useSelector(walletSelector);
  const [addresses, setAddresses] = React.useState<{ [key in string]: string } | null>(
    null,
  );

  React.useEffect(() => {
    if (wallet && !addresses) {
      wallet.ton.getAllAddresses().then((obj) => {
        setAddresses(obj);
      });
    }
  }, [wallet, addresses]);

  return addresses ?? {};
};
