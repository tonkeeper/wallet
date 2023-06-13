import { useSelector } from 'react-redux';
import { hasJettonsSelector } from '$store/jettons';

export const useShouldShowTokensButton = () => {
  const hasJettons = useSelector(hasJettonsSelector);
  const hasNfts = useSelector(hasJettonsSelector);

  return hasJettons || hasNfts;
};
