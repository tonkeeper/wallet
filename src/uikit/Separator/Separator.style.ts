import styled from '$styled';
import { ns } from '$utils';

export const Wrap = styled.View<{ absolute: boolean; toTop: boolean }>`
  ${({ absolute, toTop }) =>
    absolute
      ? `
  position: absolute;
  ${toTop ? 'top' : 'bottom'}: 0;
  left: 0;
  right: 0;
  `
      : ''}
  z-index: 1;
  height: 0;
`;

export const Separator = styled.View<{ leftOffset?: number }>`
  height: ${ns(0.5)}px;
  background: ${({ theme }) => theme.colors.border};
  margin-left: ${({ leftOffset }) => ns(leftOffset ?? 16)}px;
  margin-top: ${ns(-0.5)}px;
`;
