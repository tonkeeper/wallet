import { JettonBalanceModel } from '$store/models';
import { Address } from '@tonkeeper/shared/Address';
import { useJettons } from '@tonkeeper/shared/hooks';

export function useJetton(
  address: JettonBalanceModel['jettonAddress'],
): JettonBalanceModel {
  const { jettonBalances } = useJettons();

  return jettonBalances.find((jetton) =>
    Address.compare(jetton.jettonAddress, address),
  ) as JettonBalanceModel;
}
