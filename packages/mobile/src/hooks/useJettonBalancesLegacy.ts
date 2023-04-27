import { jettonsBalancesSelector, excludedJettonsSelector } from '$store/jettons';
import { JettonVerification } from '$store/models';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useJettonBalancesLegacy = (withExcluded = false) => {
  const jettonBalances = useSelector(jettonsBalancesSelector);
  const excludedJettons = useSelector(excludedJettonsSelector);

  const jettons = useMemo(
    () =>
      jettonBalances.filter((jetton) => {
        const isWhitelisted = jetton.verification === JettonVerification.WHITELIST;
        const excludeWhitelisted =
          isWhitelisted && excludedJettons[jetton.jettonAddress] === true;
        const excludeOther =
          !isWhitelisted && excludedJettons[jetton.jettonAddress] !== false;
        const excluded = !withExcluded && (excludeWhitelisted || excludeOther);

        return jetton.balance !== '0' && !excluded;
      }),
    [excludedJettons, jettonBalances, withExcluded],
  );

  return jettons;
};
