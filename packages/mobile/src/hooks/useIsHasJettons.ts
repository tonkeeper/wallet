import { useSelector } from 'react-redux';
import { hasJettonsSelector } from '$store/jettons';

export const useIsHasJettons = () => {
  const hasJettons = useSelector(hasJettonsSelector);
  return hasJettons;
};
