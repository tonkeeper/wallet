import React from 'react';
import { TonDiamondFeatureProps } from './TonDiamondFeature.interface';
import * as S from './TonDiamondFeature.style';
import { t } from '@tonkeeper/shared/i18n';
import { FeatureButton } from './FeatureButton/FeatureButton';

import { useCallback } from 'react';
import { AppearanceAccents, getAccentIdByDiamondsNFT } from '$styled';
import { Text } from '$uikit';
import { openAppearance } from '$core/ModalContainer/AppearanceModal';

export const TonDiamondFeature: React.FC<TonDiamondFeatureProps> = ({ nft }) => {
  const accent = AppearanceAccents[getAccentIdByDiamondsNFT(nft)];

  const handleAppearancePress = useCallback(
    () => openAppearance({ selectedAccentNFTAddress: nft.address }),
    [nft.address],
  );

  return (
    <>
      <S.Wrap>
        <S.Background />
        <S.TextWrap>
          <S.TitleWrapper>
            <Text variant="label1">{t('nft_features')}</Text>
          </S.TitleWrapper>
          <Text variant="body2" color="foregroundSecondary">
            {t('nft_diamonds_description')}
          </Text>
          <S.Badges>
            <FeatureButton
              iconName="ic-appearance-16"
              title={t('nft_change_theme')}
              color={accent.colors.accentPrimary}
              highlightColor={accent.colors.accentPrimaryLight}
              onPress={handleAppearancePress}
            />
          </S.Badges>
        </S.TextWrap>
      </S.Wrap>
    </>
  );
};
