import { jettonsBalancesSelector, sortedJettonsSelector } from '$store/jettons';
import { JettonBalanceModel, JettonVerification } from '$store/models';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '$store/wallet';
import { Address } from '@tonkeeper/shared/Address';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { TokenApprovalStatus } from '$store/zustand/tokenApproval/types';
import { getStakingJettons, useStakingStore } from '$store';
import { shallow } from 'zustand/shallow';

export interface IBalances {
  enabled: JettonBalanceModel[];
  disabled: JettonBalanceModel[];
}
export const useJettonBalances = (
  withZeroBalances?: boolean,
  showStakingJettons = false,
) => {
  const jettonBalances = useSelector(jettonsBalancesSelector);
  const wallet = useSelector(walletWalletSelector);
  const sortedJettons =
    useSelector(sortedJettonsSelector)[wallet?.vault?.getVersion?.() || ''];
  const approvalStatuses = useTokenApprovalStore();
  const stakingJettons = useStakingStore(getStakingJettons, shallow);

  const jettons = useMemo(() => {
    const balances: IBalances = {
      enabled: [],
      disabled: [],
    };

    jettonBalances.forEach((jetton) => {
      const jettonAddress = Address.parse(jetton.jettonAddress).toRaw();
      const approvalStatus = approvalStatuses.tokens[jettonAddress];
      const isBlacklisted = jetton.verification === JettonVerification.BLACKLIST;

      if (!withZeroBalances && jetton.balance === '0') {
        return;
      }

      if (
        !showStakingJettons &&
        stakingJettons.includes(Address.parse(jetton.jettonAddress).toRaw())
      ) {
        return;
      }

      if (
        (isBlacklisted && !approvalStatus) ||
        approvalStatus?.current === TokenApprovalStatus.Declined
      ) {
        balances.disabled.push(jetton);
      } else {
        balances.enabled.push(jetton);
      }
    });

    if (sortedJettons) {
      balances.enabled = balances.enabled.sort(
        (a, b) =>
          sortedJettons.indexOf(Address.parse(a.jettonAddress).toRaw()) -
          sortedJettons.indexOf(Address.parse(b.jettonAddress).toRaw()),
      );
    }

    return balances;
  }, [
    approvalStatuses.tokens,
    jettonBalances,
    showStakingJettons,
    sortedJettons,
    stakingJettons,
    withZeroBalances,
  ]);

  return jettons;
};
