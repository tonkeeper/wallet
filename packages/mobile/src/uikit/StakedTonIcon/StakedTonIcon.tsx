import { CryptoCurrencies } from '$shared/constants';
import { CurrencyIcon } from '$uikit/CurrencyIcon/CurrencyIcon';
import { getImplementationIcon } from '$utils/staking';
import { PoolInfo } from '@tonkeeper/core/src/TonAPI';
import { Steezy, View, ns } from '@tonkeeper/uikit';
import React, { FC, memo } from 'react';
import { Image } from 'react-native';

type Size = 24 | 44 | 64 | 96;

const stakingIconSizeMap: Record<Size, number> = {
  24: 12,
  44: 18,
  64: 24,
  96: 40,
};

interface Props {
  size: Size;
  pool: PoolInfo;
}

const StakedTonIconComponent: FC<Props> = (props) => {
  const { size, pool } = props;

  const stakingLogo = getImplementationIcon(pool.implementation);

  return (
    <View style={styles.container}>
      <CurrencyIcon size={size} currency={CryptoCurrencies.Ton} />
      {stakingLogo ? (
        <View style={[styles.logo, styles[`size${size}`]]}>
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
  size24: {
    width: 15,
    height: 15,
    borderWidth: 1.5,
    borderColor: colors.backgroundContentTint,
    bottom: -5.5,
    right: -5.5,
  },
  size44: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.backgroundContent,
    bottom: -6,
    right: -6,
  },
  size64: {
    width: 30,
    height: 30,
    borderWidth: 3,
    bottom: -7,
    right: -7,
  },
  size96: {
    width: 48,
    height: 48,
    borderWidth: 4,
    bottom: -10,
    right: -10,
  },
}));

export const StakedTonIcon = memo(StakedTonIconComponent);
