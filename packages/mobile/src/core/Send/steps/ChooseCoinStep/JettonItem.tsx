import { JettonBalanceModel } from '$store/models';
import { CurrencyIcon, TokenListItem } from '$uikit';
import { formatAmountAndLocalize } from '$utils';
import React, { FC, memo } from 'react';

interface Props {
  jetton: JettonBalanceModel;
  borderStart?: boolean;
  borderEnd?: boolean;
  onPress?: () => void;
}

const JettonItemComponent: FC<Props> = (props) => {
  const { jetton, borderStart, borderEnd, onPress } = props;

  const balance = `${formatAmountAndLocalize(jetton.balance, jetton.metadata.decimals)} ${
    jetton.metadata.symbol || ''
  }`;

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
