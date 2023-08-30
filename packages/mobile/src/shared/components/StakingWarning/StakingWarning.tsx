import React, { FC, memo, useCallback } from 'react';
import * as S from './StakingWarning.style';
import { openDAppBrowser } from '$navigation';
import { Icon, Spacer, Text } from '$uikit';
import { t } from '@tonkeeper/shared/i18n';

interface Props {
  name: string;
  url: string;
  title?: string;
  beta?: boolean;
  accent?: boolean;
}

const StakingWarningComponent: FC<Props> = (props) => {
  const { name, url, title, accent, beta } = props;

  const handleWarningPress = useCallback(() => {
    openDAppBrowser(url);
  }, [url]);

  return (
    <S.WarningContainer beta={accent}>
      <S.WarningTouchable
        background={accent ? 'accentOrangeActive' : 'backgroundQuaternary'}
        onPress={handleWarningPress}
      >
        <S.WarningContent>
          <Text
            variant="label1"
            color={accent ? 'backgroundPrimary' : 'foregroundPrimary'}
          >
            {title || t('staking.warning.title')}
          </Text>
          <Text
            variant="body2"
            color={accent ? 'backgroundPrimary' : 'foregroundSecondary'}
          >
            {beta ? t('staking.warning.beta_desc') : t('staking.warning.desc')}
          </Text>
          <Spacer y={4} />
          <S.WarningRow>
            <Text
              variant="label2"
              color={accent ? 'backgroundPrimary' : 'foregroundPrimary'}
            >
              {t('staking.warning.about', { name })}
            </Text>
            <Spacer x={2} />
            <S.WarningIcon>
              <Icon
                name="ic-chevron-right-12"
                color={accent ? 'backgroundPrimary' : 'foregroundPrimary'}
              />
            </S.WarningIcon>
          </S.WarningRow>
        </S.WarningContent>
      </S.WarningTouchable>
    </S.WarningContainer>
  );
};

export const StakingWarning = memo(StakingWarningComponent);
