import React, { FC } from 'react';

import { InlineHeaderProps } from './InlineHeader.interface';
import * as S from './InlineHeader.style';
import {Text} from "../Text/Text";

export const InlineHeader: FC<InlineHeaderProps> = ({ skipMargin = false, children }) => {
  return (
    <S.Wrap skipMargin={skipMargin}>
      <Text variant="h3">{children}</Text>
    </S.Wrap>
  );
};
