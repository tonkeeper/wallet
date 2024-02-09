import React from 'react';
import { openJetton } from '$navigation';
import { CryptoCurrencies, LockupNames } from '$shared/constants';
import { View } from '$uikit';
import { List } from '$uikit';
import { TonIcon } from '@tonkeeper/uikit';
import { memo } from 'react';
import { ListItemRate } from './ListItemRate';
import { openWallet } from '$core/Wallet';

interface TokenListProps {
  tokens: any; // TODO: add types
  balance: any; // TODO: add types
  rates: any; // TODO: add types
}

export const TokenList = memo<TokenListProps>(({ tokens, balance, rates }) => {
  return (
    <View>
      <List>
        <List.Item
          title="Toncoin"
          onPress={() => openWallet(CryptoCurrencies.Ton)}
          value={balance.amount.formatted}
          subvalue={balance.amount.fiat}
          leftContent={<TonIcon />}
          subtitle={
            <ListItemRate
              percent={rates.percent}
              price={rates.price}
              trend={rates.trend}
            />
          }
        />
        {balance.lockup.map((item, key) => (
          <List.Item
            key={`lockup-${key}`}
            title={LockupNames[item.type]}
            value={item.amount.formatted}
            subvalue={item.amount.fiat}
            leftContent={<TonIcon locked />}
            subtitle={rates.price}
          />
        ))}
        {tokens.list.map((item) => (
          <List.Item
            key={item.address.rawAddress}
            onPress={() => openJetton(item.address.rawAddress)}
            picture={item.iconUrl}
            title={item.name}
            value={item.quantity.formatted}
            label={item.symbol}
            // TODO:
            // subvalue={item.rate?.fiatValue}
            // subtitle={item.rate && (
            //   <ListItemRate
            //     percent={item.rate.percent}
            //     price={item.rate.fiatPrice}
            //     trend={item.rate.trend}
            //   />
            // )}
          />
        ))}
      </List>
    </View>
  );
});
