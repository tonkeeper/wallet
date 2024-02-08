import { useJettons, useNftsState } from '@tonkeeper/shared/hooks';

export const useShouldShowTokensButton = () => {
  const { jettonBalances } = useJettons();

  const hasJettons = jettonBalances.length > 0;
  const { accountNfts } = useNftsState();
  const hasNfts = Object.keys(accountNfts).length > 0;

  return hasJettons || hasNfts;
};
