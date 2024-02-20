import { useTonInscriptions } from '@tonkeeper/shared/query/hooks/useTonInscriptions';
import { useTokenApproval } from '@tonkeeper/shared/hooks';
import { InscriptionBalance } from '@tonkeeper/core/src/TonAPI';
import { useMemo } from 'react';
import { TokenApprovalStatus } from '$wallet/managers/TokenApprovalManager';

export interface IBalances {
  enabled: InscriptionBalance[];
  disabled: InscriptionBalance[];
}

export function useInscriptionBalances() {
  const inscriptions = useTonInscriptions();
  const approvalStatuses = useTokenApproval();

  return useMemo(() => {
    const balances: IBalances = {
      enabled: [],
      disabled: [],
    };
    inscriptions.items.forEach((inscription) => {
      if (
        approvalStatuses.tokens[`${inscription.ticker}_${inscription.type}`]?.current ===
        TokenApprovalStatus.Declined
      ) {
        balances.disabled.push(inscription);
      } else {
        balances.enabled.push(inscription);
      }
    });
    return balances;
  }, [approvalStatuses.tokens, inscriptions.items]);
}
