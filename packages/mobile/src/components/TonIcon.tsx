import { Steezy } from '$styles';
import { Icon, View } from '$uikit';
import React, { memo, useMemo } from 'react';

type TonIconSizes = 'small';

interface TonIconProps {
  size?: TonIconSizes;
  transparent?: boolean;
  locked?: boolean;
}

const iconSizes: { [key in TonIconSizes]: number } = {
  'small': 44
}

export const TonIcon = memo<TonIconProps>((props) => {
  const { size = 'small', transparent, locked } = props;
  
  const sizeNum = iconSizes[size];
  
  const sizeStyle = useMemo(() => ({
    width: sizeNum,
    height: sizeNum,
    borderRadius: sizeNum / 2,
  }), []);

  const containerStyle =  useMemo(() => [
    styles.container,
    transparent && styles.backgroundTransparent,
    sizeStyle,
  ], []);

  return (
    <View style={containerStyle}>
      <Icon name="ic-ton-28" color="constantLight" />
      {locked && (
        <View style={styles.locked}>
          <Icon name="ic-lock-12" color="iconSecondary" />
        </View>
      )}
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: '#0088CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundTransparent: {
    backgroundColor: colors.backgroundContentTint
  },
  locked: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    backgroundColor: colors.backgroundContentTint,
    alignItems: 'center',
    justifyContent: 'center'
  }
}));