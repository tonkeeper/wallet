import React, { FC } from 'react';
const TonWeb = require('tonweb');

import { SubscriptionProps } from './Subscription.interface';
import { BottomSheet } from '$uikit';
import { List, ListCell } from '$uikit/List/old/List';
import { useSelector } from 'react-redux';
import { subscriptionsSelector } from '$store/subscriptions';
import { formatAmount, formatSubscriptionPeriod } from '$utils';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { Ton } from '$libs/Ton';

export const Subscription: FC<SubscriptionProps> = ({ subscriptionId }) => {
  const { subscriptionsInfo } = useSelector(subscriptionsSelector);
  const subscription = subscriptionsInfo[subscriptionId];

  return (
    <BottomSheet title="Subscription">
      <List>
        <ListCell label="Merchant">{subscription.address}</ListCell>
        <ListCell label="Price">
          {formatAmount(
            Ton.fromNano(subscription.amountNano),
            Decimals[CryptoCurrencies.Ton],
          )}
        </ListCell>
        <ListCell label="Period">
          {formatSubscriptionPeriod(subscription.intervalSec)}
        </ListCell>
      </List>
    </BottomSheet>
  );
};
