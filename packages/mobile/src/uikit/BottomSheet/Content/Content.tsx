import React, { FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContentProps } from './Content.interface';
import * as S from './Content.style';
import { ns } from '$utils';

export const Content: FC<ContentProps> = ({ children, onClose, skipHeader = false, indentBottom }) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <>
      <S.ContentWrap style={{ paddingBottom: bottom + (indentBottom ? ns(16) : 0) }} skipHeader={skipHeader}>
        <S.Content>
          {typeof children === 'object' && children}
          {typeof children === 'function' && children(onClose)}
        </S.Content>
      </S.ContentWrap>
      <S.PseudoElement pointerEvents="none" skipHeader={skipHeader} />
    </>
  );
};
