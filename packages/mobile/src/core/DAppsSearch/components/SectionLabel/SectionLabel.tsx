import React, { FC, memo } from 'react';
import * as S from './SectionLabel.style';

interface Props {
  children: string;
}

const SectionLabelComponent: FC<Props> = ({ children }) => {
  return <S.Label>{children}</S.Label>;
};

export const SectionLabel = memo(SectionLabelComponent);
