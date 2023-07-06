import { formatter } from '$utils/formatter';
import { useCallback } from 'react';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';
import { AmountFormatOptions, AmountNumber } from '$libs/AmountFormatter';

export const useHideableFormatter = (countOfStars = 3) => {
  const isHidden = usePrivacyStore((state) => state.hiddenAmounts);

  const format = useCallback(
    (amount: AmountNumber = 0, options: AmountFormatOptions = {}) => {
      return !isHidden ? formatter.format(amount, options) : '*'.repeat(countOfStars);
    },
    [countOfStars, isHidden],
  );
  return format;
};
