import { Ton } from '$libs/Ton';
import { useStakingStore } from '$store';
import { jettonsBalancesSelector } from '$store/jettons';
import { useSelector } from 'react-redux';
import { shallow } from 'zustand/shallow';

export const useStakingStatuses = () => {
  const jettonBalances = useSelector(jettonsBalancesSelector);

  const stakingInfo = useStakingStore(
    (s) =>
      s.pools
        .map((pool) => ({ info: s.stakingInfo[pool.address], pool }))
        .filter(
          (item) =>
            !!item.info ||
            !!jettonBalances.find(
              (balance) =>
                Ton.formatAddress(balance.jettonAddress, { raw: true }) ===
                item.pool.liquidJettonMaster,
            ),
        ),
    shallow,
  );

  return stakingInfo;
};
