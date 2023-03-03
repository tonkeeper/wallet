import { DarkTheme, Steezy } from '$styles';
import { Icon, View } from '$uikit';
import React, { memo } from 'react';

type TonIconSizes = 'small';

interface TonIconProps {
  size?: TonIconSizes;
  transparent?: boolean;
}

const iconSizes: { [key in TonIconSizes]: number } = {
  'small': 44
}

export const TonIcon = memo<TonIconProps>((props) => {
  const { size = 'small', transparent } = props;
  
  const sizeNum = iconSizes[size];
  
  const sizeStyle = {
    width: sizeNum,
    height: sizeNum,
    borderRadius: sizeNum / 2,
  };

  const containerStyle = [
    styles.container,
    transparent && styles.backgroundTransparent,
    sizeStyle,
  ];

  return (
    <View style={containerStyle}>
      <Icon name="ic-ton-28" color="constantLight" />
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: '#0088CC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundTransparent: {
    backgroundColor: colors.backgroundContentTint
  }
}));