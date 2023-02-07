import React from 'react';
import { TonDiamondFeatureProps } from './TonDiamondFeature.interface';
import * as S from './TonDiamondFeature.style';
import { useTranslator } from '$hooks';
import { FeatureButton } from './FeatureButton/FeatureButton';
import { openAppearance } from '$navigation';
import { useCallback } from 'react';
import { AppearanceAccents, getAccentIdByDiamondsNFT } from '$styled';
import { Text } from '$uikit';

export const TonDiamondFeature: React.FC<TonDiamondFeatureProps> = ({ nft }) => {
  const t = useTranslator();

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
