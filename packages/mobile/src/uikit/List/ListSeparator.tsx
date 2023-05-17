import React, { memo } from 'react';
import { Steezy } from '$styles';
import { View } from '$uikit';

export interface ListSeparatorProps {
  absolute?: boolean;
  toTop?: boolean;
  leftOffset?: number;
  variant?: 'common' | 'alternate';
}

export const ListSeparator = memo<ListSeparatorProps>((props) => {
  const { leftOffset = 16 } = props;
  const separatorOffsetStyle = { marginLeft: leftOffset };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.separator,
          separatorOffsetStyle,
          props.variant === 'alternate' && styles.separatorAlternate,
        ]}
      />
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    zIndex: 1,
    height: 0,
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.separatorCommon,
    marginTop: -0.5,
  },
  separatorAlternate: {
    backgroundColor: colors.separatorAlternate,
  },
}));
