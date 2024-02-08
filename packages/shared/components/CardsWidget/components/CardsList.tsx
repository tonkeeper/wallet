import React, { memo } from 'react';
import { AccountState } from '@tonkeeper/core/src/managers/CardsManager';
import { List } from '@tonkeeper/uikit';

export interface CardsListProps {
  accounts: AccountState[];
}

export const CardsList = memo<CardsListProps>((props) => {
  return (
    <List>
      {props.accounts.map((account) => (
        <List.Item
          value={`${account.balance} TON`}
          subvalue={`${account.balance} euro`}
          subtitle={account.cards[0].kind}
          title={`Card *${account.cards[0].lastFourDigits}`}
        />
      ))}
    </List>
  );
});
