import { memo, useMemo } from 'react';
import { Steezy, StyleProp } from '../styles/';
import { Icon } from './Icon';
import { View } from './View';
import { ViewStyle } from 'react-native';

// TODO: move me to packages/uikit
import { TonDiamondIcon } from '@tonkeeper/mobile/src/uikit/TonDiamondIcon/TonDiamondIcon';
import { useDiamondIcon } from '@tonkeeper/mobile/src/hooks/useDiamondIcon';

export type TonIconSizes = 'xsmall' | 'small' | 'medium' | 'large' | 'xmedium' | 'xlarge';

export interface TonIconProps {
  size?: TonIconSizes;
  transparent?: boolean;
  locked?: boolean;
  showDiamond?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const iconContainerSizes: { [key in TonIconSizes]: number } = {
  xmedium: 56,
  medium: 64,
  xsmall: 24,
  small: 44,
  large: 96,
  xlarge: 72,
};

export const TonIcon = memo<TonIconProps>((props) => {
  const { size = 'small', transparent, showDiamond, locked, style } = props;

  const { hasDiamond, accentTonIcon, accent } = useDiamondIcon();
  const isTransparent = transparent ?? ((showDiamond && hasDiamond) as boolean);
  const containerSize = iconContainerSizes[size];

  const sizeStyle = useMemo(
    () => ({
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
    }),
    [containerSize],
  );

  const containerStyle = useMemo(
    () => [
      styles.container,
      isTransparent && styles.backgroundTransparent,
      sizeStyle,
      style,
    ],
    [isTransparent, sizeStyle, style],
  );

  return (
    <View style={containerStyle}>
      {showDiamond && hasDiamond ? (
        <TonDiamondIcon
          id={accent}
          size={containerSize}
          nftIcon={{ uri: accentTonIcon, size: containerSize }}
        />
      ) : (
        <Icon name="ic-ton-96" color="constantWhite" size={containerSize} />
      )}
      {locked && (
        <View style={styles.locked}>
          <Icon name="ic-lock-12" color="iconSecondary" />
        </View>
      )}
    </View>
  );
});

export const TonIconBackgroundColor = '#0098EA';

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: TonIconBackgroundColor,
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
