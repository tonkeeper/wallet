import { jettonsSelector } from '$store/jettons';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useJettonBalances = (withExcluded = false) => {
  const { jettonBalances, excludedJettons } = useSelector(jettonsSelector);

  const jettons = useMemo(
    () =>
      jettonBalances.filter((jetton) => {
        const excluded = !withExcluded && excludedJettons[jetton.jettonAddress];

        return jetton.balance !== '0' && !excluded;
      }),
    [excludedJettons, jettonBalances, withExcluded],
  );

  return jettons;
};
