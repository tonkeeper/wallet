import { JettonBalanceModel } from '$store/models';
import { CurrencyIcon, TokenListItem } from '$uikit';
import { formatter } from '$utils/formatter';
import React, { FC, memo } from 'react';

interface Props {
  jetton: JettonBalanceModel;
  borderStart?: boolean;
  borderEnd?: boolean;
  onPress?: () => void;
}

const JettonItemComponent: FC<Props> = (props) => {
  const { jetton, borderStart, borderEnd, onPress } = props;

  const balance = formatter.format(jetton.balance, {
    currency: jetton.metadata.symbol,
    currencySeparator: 'wide',
  });

  return (
    <TokenListItem
      key={jetton.jettonAddress}
      name={jetton.metadata.name}
      balance={balance}
      icon={<CurrencyIcon size={44} isJetton uri={jetton.metadata.image} />}
      onPress={onPress}
      borderStart={borderStart}
      borderEnd={borderEnd}
      bottomOffset={16}
    />
  );
};

export const JettonItem = memo(JettonItemComponent);
