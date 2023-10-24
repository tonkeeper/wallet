import { JettonBalance } from '@tonkeeper/core/src/TonAPI';
import { ListItemRate } from '../components/ListItemRate';
import { useCurrency } from '../../../hooks/useCurrency';
import { formatter } from '../../../formatter';
import { StyleSheet } from 'react-native';
import { List } from '@tonkeeper/uikit';
import { memo, useMemo } from 'react';

// TODO: copy to package.json
import BigNumber from 'bignumber.js';

// TODO: Move to
import { HideableAmount } from '@tonkeeper/mobile/src/core/HideableAmount/HideableAmount';

import { openJetton } from '@tonkeeper/mobile/src/core/Jetton/Jetton';

interface JettonBalanceItemProps {
  item: JettonBalance;
}

export const JettonBalanceItem = memo<JettonBalanceItemProps>((props) => {
  const { item } = props;
  const currency = useCurrency();

  const quantity = useMemo(() => {
    return formatter.fromNano(item.balance, item.jetton.decimals);
  }, [item.balance, item.jetton.decimals]);

  const fiatQuantity = useMemo(() => {
    if (item.price) {
      return new BigNumber(quantity).multipliedBy(item.price.value);
    }
  }, [item.price, quantity]);

  return (
    <List.Item
      onPress={() => openJetton(item.jetton.address)}
      picture={item.jetton.image}
      title={item.jetton.symbol}
      value={
        <HideableAmount style={styles.valueText} variant="label1" stars=" * * *">
          {formatter.format(quantity)}
        </HideableAmount>
      }
      {...(item.price && {
        subtitle: <ListItemRate price={item.price} />,
        subvalue: (
          <HideableAmount
            style={styles.subvalueText}
            color="textSecondary"
            variant="body2"
          >
            {formatter.format(fiatQuantity, { currency })}
          </HideableAmount>
        ),
      })}
    />
  );
});

const styles = StyleSheet.create({
  valueText: {
    textAlign: 'right',
    flexShrink: 1,
  },
  subvalueText: {
    textAlign: 'right',
  },
});
