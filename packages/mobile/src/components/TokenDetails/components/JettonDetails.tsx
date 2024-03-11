import React, { memo } from 'react';
import { Jetton } from 'tonapi-sdk-js';
import { List } from '$uikit';
import FastImage from 'react-native-fast-image';
import { Address } from '@tonkeeper/core';
import { Steezy, copyText, View, Icon } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';

export interface JettonDetailsProps {
  jetton: Jetton;
}

export const JettonDetails = memo<JettonDetailsProps>((props) => {
  return (
    <List compact={false}>
      <List.Item
        onPress={copyText(props.jetton?.name)}
        title={t('tokenDetails.name')}
        subtitle={props.jetton.name}
        value={
          <FastImage style={styles.square.static} source={{ uri: props.jetton.image }} />
        }
      />
      <List.Item
        onPress={copyText(props.jetton?.address)}
        title={t('tokenDetails.token_id')}
        subtitle={Address.parse(props.jetton.address).toShort(4)}
        value={
          <View style={styles.copyIconContainer}>
            <Icon color="iconSecondary" name={'ic-copy-16'} />
          </View>
        }
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
  copyIconContainer: {
    margin: 4,
  },
});
