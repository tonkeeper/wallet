import { useSelector } from 'react-redux';
import { hasJettonsSelector } from '$store/jettons';
import { useNftItems } from '@tonkeeper/shared/query/hooks/useNftList';

export const useShouldShowTokensButton = () => {
  const hasJettons = useSelector(hasJettonsSelector);
  const nftItems = useNftItems();

  return hasJettons || nftItems.length > 0;
};
