import React, { FC, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ns } from '$utils';
import * as S from './TabBarSpacer.style';
import { TabBarSpacerProps } from './TabBarSpacer.interface';

const TAB_BAR_HEIGHT = ns(64);

export const TabBarSpacer: FC<TabBarSpacerProps> = ({ children, ...otherProps }) => {
  const { bottom } = useSafeAreaInsets();

  const marginBottom = useMemo(() => bottom + TAB_BAR_HEIGHT, [bottom]);

  return (
    <S.Container marginBottom={marginBottom} {...otherProps}>
      {children}
    </S.Container>
  );
};
