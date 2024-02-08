import { Address } from '@tonkeeper/shared/Address';
import { useJettons, useStakingState } from '@tonkeeper/shared/hooks';

export const useStakingStatuses = () => {
  const { jettonBalances } = useJettons();

  const stakingInfo = useStakingState(
    (s) =>
      s.pools
        .map((pool) => ({ info: s.stakingInfo[pool.address], pool }))
        .filter((item) => {
          const jettonBalance = jettonBalances.find(
            (balance) =>
              Address.parse(balance.jettonAddress).toRaw() ===
              item.pool.liquid_jetton_master,
          );

          return !!item.info || (!!jettonBalance && jettonBalance.balance !== '0');
        }),
    [jettonBalances],
  );

  return stakingInfo;
};
