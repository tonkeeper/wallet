import React from 'react';
import { AboutProps } from './About.interface';
import * as S from './About.style';
import { useTranslator } from '$hooks';
import { ShowMore, Text } from '$uikit';
const MAX_LENGTH = 122;

export const About: React.FC<AboutProps> = ({ description, collection }) => {
  const t = useTranslator();

  if (!description) {
    return null;
  }

  return (
    <>
      <S.Wrap>
        <S.Background />
        <S.TextWrap>
          <S.TitleWrapper>
            <Text variant="label1">{t('nft_about_collection', { collection })}</Text>
          </S.TitleWrapper>
          <ShowMore maxLines={3} text={description} />
        </S.TextWrap>
      </S.Wrap>
    </>
  );
};
