import React, { memo } from 'react';
import { Jetton } from 'tonapi-sdk-js';
import { List } from '$uikit';
import FastImage from 'react-native-fast-image';
import { Steezy } from '@tonkeeper/uikit';
import { Address } from '@tonkeeper/core';

export interface JettonDetailsProps {
  jetton: Jetton;
}

export const JettonDetails = memo<JettonDetailsProps>((props) => {
  return (
    <List compact={false}>
      <List.Item
        title="Name"
        subtitle={props.jetton.name}
        value={
          <FastImage style={styles.square.static} source={{ uri: props.jetton.image }} />
        }
      />
      <List.Item
        title="Token ID"
        subtitle={Address.parse(props.jetton.address).toShort(4)}
      />
    </List>
  );
});

export const styles = Steezy.create({
  square: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});
