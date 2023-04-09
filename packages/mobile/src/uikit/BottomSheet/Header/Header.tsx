import React, { FC } from 'react';

import { useTheme } from '$hooks/useTheme';
import { Icon } from '../../Icon';

import { HeaderProps } from './Header.interface';
import * as S from './Header.style';

export const Header: FC<HeaderProps> = (props) => {
  const { title, onClose, skipDismissButton = false } = props;
  const { colors } = useTheme();

  return (
    <>
      <S.Header>
        <S.HeaderTitle>{title}</S.HeaderTitle>
      </S.Header>
      {!skipDismissButton && (
        <S.HeaderCloseButtonWrap onPress={onClose}>
          <S.HeaderCloseButton>
            <Icon name="ic-close-16" color="foregroundPrimary" />
          </S.HeaderCloseButton>
        </S.HeaderCloseButtonWrap>
      )}
    </>
  );
};
