import { Icon } from '$uikit';
import React, { FC, memo } from 'react';
import * as S from './SearchButton.style';
import { t } from '@tonkeeper/shared/i18n';

interface Props {
  onPress?: () => void;
}

const SearchButtonComponent: FC<Props> = (props) => {
  const { onPress } = props;

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
