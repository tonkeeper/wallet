import { useTranslator } from '$hooks';
import { Icon } from '$uikit';
import React, { FC, memo } from 'react';
import * as S from './SearchButton.style';

interface Props {
  onPress?: () => void;
}

const SearchButtonComponent: FC<Props> = (props) => {
  const { onPress } = props;

  const t = useTranslator();

  return (
    <S.Touchable onPress={onPress}>
      <S.Wrap>
        <Icon name="ic-magnifying-glass-16" />
        <S.Label>{t('browser.search_label')}</S.Label>
      </S.Wrap>
    </S.Touchable>
  );
};

export const SearchButton = memo(SearchButtonComponent);
