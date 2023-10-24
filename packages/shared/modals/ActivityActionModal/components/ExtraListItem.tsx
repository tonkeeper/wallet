import { useCurrency } from '../../../hooks/useCurrency';
import { List, copyText } from '@tonkeeper/uikit';
import { formatter } from '../../../formatter';
import { memo, useMemo } from 'react';
import { t } from '../../../i18n';

// TODO: move to manager
import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';

interface ExtraListItemProps {
  extra?: number;
}

export const ExtraListItem = memo<ExtraListItemProps>((props) => {
  const currency = useCurrency();
  const tokenPrice = useTokenPrice('ton');

  const extra = useMemo(() => {
    if (props.extra) {
      const extra = formatter.fromNano(props.extra ?? 0, 9);
      const fiatAmount = tokenPrice.fiat * parseFloat(extra);

      return {
        isNegative: formatter.isNegative(extra),
        value: formatter.format(extra, {
          postfix: 'TON',
          absolute: true,
          decimals: 9,
        }),
        fiat: formatter.format(fiatAmount, {
          currencySeparator: 'wide',
          absolute: true,
          decimals: 9,
          currency,
        }),
      };
    }
  }, [props.extra, tokenPrice.fiat]);

  if (!extra) {
    return null;
  }

  return (
    <List.Item
      titleType="secondary"
      title={extra.isNegative ? t('transaction_fee') : t('transaction_refund')}
      onPress={copyText(extra.value)}
      value={extra.value}
      subvalue={extra.fiat}
    />
  );
});
