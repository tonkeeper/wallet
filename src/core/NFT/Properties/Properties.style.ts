import styled, { RADIUS } from '$styled';
import { nfs, ns } from '$utils';

export const TitleWrapper = styled.View`
  margin-bottom: ${ns(14)}px;
`;

export const Container = styled.View`
  margin-bottom: ${ns(30)}px;
  flex: 1;
`;

export const ItemContainer = styled.View`
  flex: 1;
  margin-right: ${ns(12)}px;
`;

export const Background = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const ContentWrap = styled.View`
  z-index: 2;
  padding: ${ns(10)}px ${ns(16)}px ${ns(12)}px ${ns(16)}px;
`;