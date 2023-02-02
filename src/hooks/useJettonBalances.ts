import { jettonsSelector } from '$store/jettons';
import { JettonVerification } from '$store/models';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useJettonBalances = (withExcluded = false) => {
  const { jettonBalances, excludedJettons } = useSelector(jettonsSelector);

  const jettons = useMemo(
    () =>
      jettonBalances.filter((jetton) => {
        const isWhitelisted = jetton.verification === JettonVerification.WHITELIST;
        const excludeWhitelisted = (isWhitelisted && excludedJettons[jetton.jettonAddress] === true);
        const excludeOther = !isWhitelisted && excludedJettons[jetton.jettonAddress] !== false;
        const excluded = !withExcluded && (excludeWhitelisted || excludeOther);

        return jetton.balance !== '0' && !excluded;
      }),
    [excludedJettons, jettonBalances, withExcluded],
  );

  return jettons;
};
