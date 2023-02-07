import { useSelector } from 'react-redux';
import { mainSelector } from '$store/main';

export const useDeeplinkingIsReady = () => {
  const { isMainStackInited } = useSelector(mainSelector);
  return isMainStackInited;
}