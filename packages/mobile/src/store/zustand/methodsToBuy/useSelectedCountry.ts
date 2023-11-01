import { getCountry } from 'react-native-localize';
import { useMethodsToBuyStore } from './useMethodsToBuyStore';

export const useSelectedCountry = () => {
  const selectedCountry = useMethodsToBuyStore((state) => state.selectedCountry);

  return selectedCountry === 'AUTO' ? getCountry() : selectedCountry;
};
