import React, { FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ns } from '$utils';
import * as S from './BottomButtonWrap.style';
import { useTheme } from '$hooks';

export const BottomButtonWrapHelper: FC = () => {
  const { bottom } = useSafeAreaInsets();
  return (
    <S.Helper
      style={{
        height: ns(56 + 16) + bottom + ns(16),
      }}
    />
  );
};

export const BottomButtonWrap: FC = ({ children }) => {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <S.Wrap
      style={{
        paddingBottom: bottom + ns(16),
      }}
    >
      <S.Gradient
        colors={['rgba(21, 28, 41, 0)', theme.colors.backgroundPrimary]}
        locations={[0, 1]}
      />
      <S.Content>{children}</S.Content>
    </S.Wrap>
  );
};
