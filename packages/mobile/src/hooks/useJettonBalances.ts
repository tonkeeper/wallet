import { JettonBalanceModel, JettonVerification } from '$store/models';
import { useMemo } from 'react';
import { Address } from '@tonkeeper/shared/Address';
import { useJettons, useStakingState, useTokenApproval } from '@tonkeeper/shared/hooks';
import { getStakingJettons } from '@tonkeeper/shared/utils/staking';
import { TokenApprovalStatus } from '$wallet/managers/TokenApprovalManager';

export interface IBalances {
  enabled: JettonBalanceModel[];
  disabled: JettonBalanceModel[];
}
export const useJettonBalances = (showStakingJettons = false) => {
  const { jettonBalances } = useJettons();
  const approvalStatuses = useTokenApproval();
  const stakingJettons = useStakingState(getStakingJettons);

  const jettons = useMemo(() => {
    const balances: IBalances = {
      enabled: [],
      disabled: [],
    };

    jettonBalances.forEach((jetton) => {
      const jettonAddress = Address.parse(jetton.jettonAddress).toRaw();
      const approvalStatus = approvalStatuses.tokens[jettonAddress];
      const isBlacklisted = jetton.verification === JettonVerification.BLACKLIST;

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

    return balances;
  }, [approvalStatuses.tokens, jettonBalances, showStakingJettons, stakingJettons]);

  return jettons;
};
