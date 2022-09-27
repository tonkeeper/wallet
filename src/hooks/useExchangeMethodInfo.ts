import { useSelector } from 'react-redux';

import { exchangeSelector } from '$store/exchange';
import { ExchangeMethodModel } from '$store/models';

export function useExchangeMethodInfo(id: string = ''): ExchangeMethodModel {
  const { methodInfo } = useSelector(exchangeSelector);
  return methodInfo[id];
}
