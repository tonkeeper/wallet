import React, { FC, useCallback } from 'react';

import { ModalProps } from './Modal.interface';
import * as S from './Modal.style';
import { goBack } from '$navigation';
import { Icon } from '$uikit/Icon/Icon';
import { useTheme } from '$hooks';

export const Modal: FC<ModalProps> = (props) => {
  const { title, children, skipDismissButton = false } = props;
  const theme = useTheme();

  const handleDismiss = useCallback(() => {
    goBack();
  }, []);

  return (
    <S.Wrap>
      <S.DismissOverlay onPress={handleDismiss} />
      <S.Content>
        {!!title && (
          <S.Header>
            <S.HeaderTitle>{title}</S.HeaderTitle>
          </S.Header>
        )}
        {!skipDismissButton && (
          <S.HeaderCloseButtonWrap onPress={handleDismiss}>
            <S.HeaderCloseButton>
              <Icon
                name="ic-close-16"
                color="foregroundPrimary"
              />
            </S.HeaderCloseButton>
          </S.HeaderCloseButtonWrap>
        )}
        {children}
      </S.Content>
    </S.Wrap>
  );
};
