import React, { FC } from 'react';

import * as S from './Separator.style';
import { SeparatorProps } from '../Separator/Separator.interface';
import { useTheme } from '$hooks/useTheme';

export const Separator: FC<SeparatorProps> = (props) => {
  const {
    absolute = false,
    backgroundColor = 'backgroundSecondary',
    toTop = false,
    leftOffset = 16,
  } = props;
  const theme = useTheme();

  return (
    <S.Wrap
      absolute={absolute}
      toTop={toTop}
      style={{ backgroundColor: theme.colors[backgroundColor] }}
    >
      <S.Separator leftOffset={leftOffset} />
    </S.Wrap>
  );
};
