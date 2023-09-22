// import { useTonkeeper } from '@tonkeeper/shared/hooks/useTonkeeper';
import { formatter } from '$utils/formatter';
import { useCallback, useMemo } from 'react';
import {
  AmountFormatNanoOptions,
  AmountFormatOptions,
  AmountNumber,
} from '@tonkeeper/core';

export const useHideableFormatter = () => {
  const ishiddenBalances = false//  useTonkeeper((state) => state.hiddenBalances);

  const format = useCallback(
    (amount: AmountNumber = 0, options: AmountFormatOptions = {}) => {
      return !ishiddenBalances ? formatter.format(amount, options) : '* * *';
    },
    [ishiddenBalances],
  );

  const formatNano = useCallback(
    (amount: AmountNumber = 0, options: AmountFormatNanoOptions = {}) => {
      return !ishiddenBalances ? formatter.formatNano(amount, options) : '* * *';
    },
    [ishiddenBalances],
  );

  return useMemo(() => ({ format, formatNano }), [format, formatNano]);
};
