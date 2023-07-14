import { accentSelector, accentTonIconSelector } from '$store/main';
import { AccentKey } from '$styled';
import { Steezy } from '$styles';
import { Icon, TonDiamondIcon, View } from '$uikit';
import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

type TonIconSizes = 'small' | 'medium';

export interface TonIconProps {
  size?: TonIconSizes;
  transparent?: boolean;
  locked?: boolean;
  showDiamond?: boolean;
}

const iconSizes: { [key in TonIconSizes]: number } = {
  'medium': 40,
  'small': 28,
}

const containerSizes: { [key in TonIconSizes]: number } = {
  'medium': 64,
  'small': 44,
}

export const TonIcon = memo<TonIconProps>((props) => {
  const { size = 'small', transparent, showDiamond, locked } = props;
  
  const accentTonIcon = useSelector(accentTonIconSelector);
  const accent = useSelector(accentSelector);

  const shouldShowCustomTonIcon = showDiamond && accent !== AccentKey.default;
  const isTransparent = transparent ?? shouldShowCustomTonIcon;

  const containerSize = containerSizes[size];
  const iconSize = iconSizes[size];
  
  const sizeStyle = useMemo(() => ({
    width: containerSize,
    height: containerSize,
    borderRadius: containerSize / 2,
  }), [containerSize]);

  const containerStyle =  useMemo(() => [
    styles.container,
    isTransparent && styles.backgroundTransparent,
    sizeStyle,
  ], [isTransparent, sizeStyle]);

  return (
    <View style={containerStyle}>
      {shouldShowCustomTonIcon && accentTonIcon ? (
        <TonDiamondIcon id={accent} size={containerSize} nftIcon={accentTonIcon} />
      ) : (
        <Icon size={iconSize} name="ic-ton-28" color="constantLight" />
      )}
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
    // overflow: 'hidden',
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