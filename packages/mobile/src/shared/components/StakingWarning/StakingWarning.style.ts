import styled from '$styled';
import { Highlight } from '$uikit';
import { ns } from '@tonkeeper/uikit';

export const WarningContainer = styled.View`
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${ns(16)}px;
  overflow: hidden;
`;

export const WarningTouchable = styled(Highlight).attrs({ useRNGHComponent: true })`
  position: relative;
`;

export const WarningContent = styled.View`
  padding: ${ns(12)}px ${ns(16)}px;
`;

export const WarningRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const WarningIcon = styled.View`
  margin-top: ${ns(2)}px;
`;
