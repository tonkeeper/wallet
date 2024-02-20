import { useJettons, useNftsState } from '@tonkeeper/shared/hooks';
import { useTonInscriptions } from '@tonkeeper/shared/query/hooks/useTonInscriptions';

export const useShouldShowTokensButton = () => {
  const { jettonBalances } = useJettons();
  const inscriptions = useTonInscriptions();
  const { accountNfts } = useNftsState();

  return Boolean(
    inscriptions.items?.length ||
      jettonBalances.length > 0 ||
      Object.keys(accountNfts).length > 0,
  );
};
