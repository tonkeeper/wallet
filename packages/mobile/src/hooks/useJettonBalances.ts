import {
  excludedJettonsSelector,
  jettonsBalancesSelector,
  sortedJettonsSelector,
} from '$store/jettons';
import { JettonBalanceModel, JettonVerification } from '$store/models';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '$store/wallet';
import { Address } from '$libs/Ton';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { TokenApprovalStatus } from '$store/zustand/tokenApproval/types';
import { DevFeature, useDevFeatureEnabled } from '$store';

export interface IBalances {
  pending: JettonBalanceModel[];
  enabled: JettonBalanceModel[];
  disabled: JettonBalanceModel[];
}
export const useJettonBalances = () => {
  const tokenApproval = useDevFeatureEnabled(DevFeature.TokenApproval);
  const jettonBalances = useSelector(jettonsBalancesSelector);
  const wallet = useSelector(walletWalletSelector);
  const sortedJettons =
    useSelector(sortedJettonsSelector)[wallet?.vault?.getVersion?.() || ''];
  const approvalStatuses = useTokenApprovalStore();
  const excludedJettons = useSelector(excludedJettonsSelector);

  const jettons = useMemo(() => {
    const balances: IBalances = {
      pending: [],
      enabled: [],
      disabled: [],
    };

    jettonBalances.forEach((jetton) => {
      const approvalStatus = approvalStatuses.tokens[jetton.jettonAddress];
      const isWhitelisted = jetton.verification === JettonVerification.WHITELIST;
      const isBlacklisted = jetton.verification === JettonVerification.BLACKLIST;

      if (jetton.balance === '0') return;

      if (
        (isWhitelisted && !approvalStatus) ||
        approvalStatus?.current === TokenApprovalStatus.Approved
      ) {
        balances.enabled.push(jetton);
      } else if (
        (isBlacklisted && !approvalStatus) ||
        approvalStatus?.current === TokenApprovalStatus.Declined
      ) {
        balances.disabled.push(jetton);
      } else {
        balances.pending.push(jetton);
      }
    });

    if (sortedJettons) {
      balances.enabled = balances.enabled.sort(
        (a, b) =>
          sortedJettons.indexOf(new Address(a.jettonAddress).format({ raw: true })) -
          sortedJettons.indexOf(new Address(b.jettonAddress).format({ raw: true })),
      );
    }

    return balances;
  }, [approvalStatuses.tokens, jettonBalances, sortedJettons]);

  if (!tokenApproval) {
    const legacyJettons = jettonBalances.filter((jetton) => {
      const isWhitelisted = jetton.verification === JettonVerification.WHITELIST;
      const excludeWhitelisted =
        isWhitelisted && excludedJettons[jetton.jettonAddress] === true;
      const excludeOther =
        !isWhitelisted && excludedJettons[jetton.jettonAddress] !== false;
      const excluded = excludeWhitelisted || excludeOther;

      return jetton.balance !== '0' && !excluded;
    });
    return {
      pending: [],
      enabled: legacyJettons,
      disabled: [],
    };
  }

  return jettons;
};
