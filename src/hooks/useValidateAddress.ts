import { useMemo } from 'react';

import TonWeb from 'tonweb';

export const useValidateAddress = (address) => {
  const isValid = useMemo(() => {
    if (address.length > 0) {
      try {
        const addr = new TonWeb.utils.Address(address);
        if (!isNaN(addr.wc)) {
          return true;
        }
      } catch (e) {
        return false;
      }
    }

    return false;
  }, [address]);
  return useMemo(
    () => ({
      address,
      isValid,
    }),
    [address, isValid],
  );
};
