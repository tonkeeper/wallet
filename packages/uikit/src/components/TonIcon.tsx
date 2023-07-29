import { memo, useMemo } from 'react';
import { Steezy, StyleProp } from '../styles/';
import { Icon } from './Icon';
import { View } from './View';
import { ViewStyle } from 'react-native';

type TonIconSizes = 'small' | 'medium' | 'large';

export interface TonIconProps {
  size?: TonIconSizes;
  transparent?: boolean;
  locked?: boolean;
  showDiamond?: boolean;
  style?: StyleProp<ViewStyle>;
}

const iconSizes: { [key in TonIconSizes]: number } = {
  medium: 40,
  small: 28,
  large: 56,
};

const containerSizes: { [key in TonIconSizes]: number } = {
  medium: 64,
  small: 44,
  large: 96,
};

export const TonIcon = memo<TonIconProps>((props) => {
  const { size = 'small', transparent, locked, style } = props;

  const isTransparent = transparent; // ?? shouldShowCustomTonIcon;
  const containerSize = containerSizes[size];
  const iconSize = iconSizes[size];
  const sizeNum = iconSizes[size];

  const sizeStyle = useMemo(
    () => ({
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
    }),
    [containerSize],
  );

  const containerStyle = useMemo(
    () => [styles.container, isTransparent && styles.backgroundTransparent, sizeStyle, style],
    [isTransparent, sizeStyle, style],
  );

  return (
    <View style={containerStyle}>
      <Icon name="ic-ton-28" size={iconSize} color="constantWhite" />
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
    backgroundColor: colors.backgroundContentTint,
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
    justifyContent: 'center',
  },
}));
