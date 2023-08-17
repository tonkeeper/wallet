import { StakingProvider } from '$store';
import React, { FC, memo, useCallback } from 'react';
import * as S from './StakingWarning.style';
import { openDAppBrowser } from '$navigation';
import { Icon, Spacer, Text } from '$uikit';
import { t } from '@tonkeeper/shared/i18n';

interface Props {
  provider: StakingProvider;
}

const StakingWarningComponent: FC<Props> = (props) => {
  const { provider } = props;

  const handleWarningPress = useCallback(() => {
    if (!provider.url) {
      return;
    }

    openDAppBrowser(provider.url);
  }, [provider.url]);

  return (
    <S.WarningContainer>
      <S.WarningTouchable background="backgroundQuaternary" onPress={handleWarningPress}>
        <S.WarningContent>
          <Text variant="label1">{t('staking.warning.title')}</Text>
          <Text variant="body2" color="foregroundSecondary">
            {t('staking.warning.desc')}
          </Text>
          <Spacer y={4} />
          <S.WarningRow>
            <Text variant="label2">
              {t('staking.warning.about', { name: provider.name })}
            </Text>
            <Spacer x={2} />
            <S.WarningIcon>
              <Icon name="ic-chevron-right-12" color="foregroundPrimary" />
            </S.WarningIcon>
          </S.WarningRow>
        </S.WarningContent>
      </S.WarningTouchable>
    </S.WarningContainer>
  );
};

export const StakingWarning = memo(StakingWarningComponent);
