import { PoolImplementationType } from '@tonkeeper/core/src/TonAPI';
import { getImplementationIcon } from '@tonkeeper/mobile/src/utils/staking';
import { FastImage, Steezy } from '@tonkeeper/uikit';
import { FC, memo } from 'react';

interface Props {
  implementation: PoolImplementationType;
}

const StakingIconComponent: FC<Props> = (props) => {
  return (
    <FastImage
      style={styles.stakingImage}
      resizeMode="cover"
      source={getImplementationIcon(props.implementation)}
    />
  );
};

export const StakingIcon = memo(StakingIconComponent);

const styles = Steezy.create(({ colors }) => ({
  stakingImage: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
    backgroundColor: colors.backgroundContent,
  },
}));
