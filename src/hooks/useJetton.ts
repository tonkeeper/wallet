import { JettonBalanceModel } from '$store/models';
import { useSelector } from 'react-redux';
import { jettonsSelector } from '$store/jettons';

export function useJetton(
  address: JettonBalanceModel['jettonAddress'],
): JettonBalanceModel {
  const { jettonBalances } = useSelector(jettonsSelector);

  return jettonBalances.find(
    (jetton) => jetton.jettonAddress === address,
  ) as JettonBalanceModel;
}
