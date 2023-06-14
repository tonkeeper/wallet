import { useSelector } from 'react-redux';
import { hasJettonsSelector } from '$store/jettons';
import { hasNftsSelector } from '$store/nfts';

export const useShouldShowTokensButton = () => {
  const hasJettons = useSelector(hasJettonsSelector);
  const hasNfts = useSelector(hasNftsSelector);

  return hasJettons || hasNfts;
};
