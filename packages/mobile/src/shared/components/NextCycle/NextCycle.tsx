import { useStakingCycle } from '$hooks/useStakingCycle';
import { Text } from '$uikit';
import React, { FC, memo } from 'react';
import * as S from './NextCycle.style';
import { t } from '@tonkeeper/shared/i18n';
import { PoolInfo, PoolImplementationType } from '@tonkeeper/core/src/TonAPI';

interface Props {
  pool: PoolInfo;
}

const NextCycleComponent: FC<Props> = (props) => {
  const {
    pool: { cycle_start, cycle_end, implementation },
  } = props;

  const { formattedDuration, isCooldown } = useStakingCycle(cycle_start, cycle_end);

  if (isCooldown && implementation !== PoolImplementationType.LiquidTF) {
    return (
      <S.Container>
        <S.Row>
          <Text variant="label1">{t('staking.details.cooldown.title')}</Text>
          <Text variant="label1">{t('staking.details.cooldown.active')}</Text>
        </S.Row>
        <Text variant="body2" color="foregroundSecondary">
          {t('staking.details.cooldown.desc')}
        </Text>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <Text color="foregroundSecondary" variant="body2">
        {t('staking.details.next_cycle.message', { value: formattedDuration })}
      </Text>
    </S.Container>
  );
};

export const NextCycle = memo(NextCycleComponent);
