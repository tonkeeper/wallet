import styled, { RADIUS } from '$styled';
import { Highlight, Text } from '$uikit';
import { ns } from '$utils';

export const Touchable = styled(Highlight).attrs({ background: 'backgroundTertiary' })`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
`;

export const Wrap = styled.View`
  height: ${ns(48)}px;
  padding: 0 ${ns(16)}px;
  flex-direction: row;
  align-items: center;
`;

export const Label = styled(Text).attrs({
  variant: 'body1',
  color: 'foregroundSecondary',
})`
  margin-left: ${ns(12)}px;
`;
