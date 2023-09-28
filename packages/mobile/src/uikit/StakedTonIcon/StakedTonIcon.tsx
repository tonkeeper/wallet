import { getImplementationIcon } from '$utils/staking';
import { PoolInfo } from '@tonkeeper/core/src/TonAPI';
import { Steezy, TonIcon, TonIconProps, View, ns } from '@tonkeeper/uikit';
import { TonIconSizes } from '@tonkeeper/uikit/src/components/TonIcon';
import React, { FC, memo } from 'react';
import { Image } from 'react-native';

const stakingIconSizeMap: Record<TonIconSizes, number> = {
  xsmall: 12,
  small: 18,
  medium: 24,
  xmedium: 24,
  large: 40,
};

interface Props {
  size: Required<TonIconProps['size']>;
  pool: PoolInfo;
}

const StakedTonIconComponent: FC<Props> = (props) => {
  const { size = 'small', pool } = props;

  const stakingLogo = getImplementationIcon(pool.implementation);

  return (
    <View style={styles.container}>
      <TonIcon size={size} showDiamond />
      {stakingLogo ? (
        <View style={[styles.logo, styles[size]]}>
          <Image
            source={stakingLogo}
            style={{
              width: ns(stakingIconSizeMap[size]),
              height: ns(stakingIconSizeMap[size]),
            }}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    position: 'relative',
  },
  logo: {
    borderRadius: 40,
    backgroundColor: colors.backgroundContentTint,
    position: 'absolute',
    borderColor: colors.backgroundPage,
    overflow: 'hidden',
  },
  xsmall: {
    width: 15,
    height: 15,
    borderWidth: 1.5,
    borderColor: colors.backgroundContentTint,
    bottom: -5.5,
    right: -5.5,
  },
  small: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.backgroundContent,
    bottom: -6,
    right: -6,
  },
  medium: {
    width: 30,
    height: 30,
    borderWidth: 3,
    bottom: -7,
    right: -7,
  },
  xmedium: {
    width: 30,
    height: 30,
    borderWidth: 3,
    bottom: -7,
    right: -7,
  },
  large: {
    width: 48,
    height: 48,
    borderWidth: 4,
    bottom: -10,
    right: -10,
  },
}));

export const StakedTonIcon = memo(StakedTonIconComponent);
