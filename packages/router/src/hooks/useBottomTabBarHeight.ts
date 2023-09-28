import { useBottomTabBarHeight as useBottomTabBarHeightRN } from '@react-navigation/bottom-tabs';

export const useBottomTabBarHeight = () => {
  try {
    return useBottomTabBarHeightRN();
  } catch (err) {
    return 0;
  }
};
