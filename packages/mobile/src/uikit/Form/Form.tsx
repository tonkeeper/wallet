import React, { FC } from 'react';

import * as S from './Form.style';

export const Form: FC = ({ children }) => {
  return <S.Wrap>{children}</S.Wrap>;
};
