import styled from '$styled';
import { Highlight } from '$uikit';
import { nfs, ns } from '$utils';

export const Wrap = styled.View`
  margin-top: ${ns(12)}px;
  margin-right: ${ns(12)}px;
`;

export const Touchable = styled(Highlight)<{ color?: string }>`
  background: ${({ theme, color }) => color ?? theme.colors.backgroundTertiary};
  border-radius: ${ns(18)}px;
  overflow: hidden;
`;

export const InnerContainer = styled.View<{ withIcon?: boolean }>`
  height: ${ns(36)}px;
  flex-direction: row;
  align-items: center;
  padding: 0 ${nfs(16)}px 0 ${({ withIcon }) => nfs(withIcon ? 10 : 16)}px;
`;

export const IconContainer = styled.View`
  margin-right: ${ns(8)}px;
`;
