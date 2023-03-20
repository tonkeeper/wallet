import { JettonBalanceModel } from '$store/models';

export const sortJettons = (
  orderJettons: string[] | undefined,
  jettons: JettonBalanceModel[],
) => {
  if (!orderJettons) {
    return jettons;
  }
  return jettons.sort(
    (a, b) =>
      orderJettons.indexOf(a.jettonAddress) - orderJettons.indexOf(b.jettonAddress),
  );
};
