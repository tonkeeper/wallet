import { formatter } from '$utils/formatter';
import { useCallback } from 'react';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';
import { AmountFormatOptions, AmountNumber } from '@tonkeeper/core';

export const useHideableFormatter = () => {
  const isHidden = usePrivacyStore((state) => state.hiddenAmounts);

  const format = useCallback(
    (amount: AmountNumber = 0, options: AmountFormatOptions = {}) => {
      return !isHidden ? formatter.format(amount, options) : '* * *';
    },
    [isHidden],
  );
  return format;
};
