import { formatter } from '$utils/formatter';
import { useCallback, useMemo } from 'react';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';
import {
  AmountFormatNanoOptions,
  AmountFormatOptions,
  AmountNumber,
} from '@tonkeeper/core';

export const useHideableFormatter = () => {
  const isHidden = usePrivacyStore((state) => state.hiddenAmounts);

  const format = useCallback(
    (amount: AmountNumber = 0, options: AmountFormatOptions = {}) => {
      return !isHidden ? formatter.format(amount, options) : '* * *';
    },
    [isHidden],
  );

  const formatNano = useCallback(
    (amount: AmountNumber = 0, options: AmountFormatNanoOptions = {}) => {
      return !isHidden ? formatter.formatNano(amount, options) : '* * *';
    },
    [isHidden],
  );

  return useMemo(() => ({ format, formatNano }), [format, formatNano]);
};
