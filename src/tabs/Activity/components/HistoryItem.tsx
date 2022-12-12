import React, { memo } from 'react';
import { Steezy } from '$styles';
import { View } from '$uikit';
import { List } from '$uikit/List/new';

type TransactionItemType = {

}

interface TransactionItemProps {
  item: any;
}

export const HistoryItem = memo<TransactionItemProps>(({ item }) => {
  return (
    <List headerTitle={item.date} style={item.date ? styles.list : styles.list2}>
      {item.actions.map((action, key) => (
        <List.Item
          key={key}
          onPress={() => {}}
          title={action.isReceive ? 'Received' : 'Sent'}
          subtitle={action.address}
          value={'' + action.amount}
          subvalue={action.date}
        />
      ))}
    </List>
  );
});

const styles = Steezy.create({
  list: {
    marginBottom: 8
  },
  list2: {
    marginBottom: 16
  }
});