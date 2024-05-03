import React, { FC, ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { convertHexToRGBA, ns } from '$utils';
import * as S from './BottomButtonWrap.style';
import { useTheme } from '$hooks/useTheme';

export const BottomButtonWrapHelper: FC<{ safeArea?: boolean }> = (props) => {
  const { safeArea = true } = props;
  const { bottom } = useSafeAreaInsets();
  return (
    <S.Helper
      style={{
        height: ns(56 + 16) + (safeArea ? bottom : 0) + ns(16),
      }}
    />
  );
};

export const BottomButtonWrap: FC<{ children: ReactNode }> = ({ children }) => {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <S.Wrap
      style={{
        paddingBottom: bottom + ns(16),
      }}
    >
      <S.Gradient
        colors={[
          convertHexToRGBA(theme.colors.backgroundPrimary, 0),
          theme.colors.backgroundPrimary,
        ]}
        locations={[0, 1]}
      />
      <S.Content>{children}</S.Content>
    </S.Wrap>
  );
};
