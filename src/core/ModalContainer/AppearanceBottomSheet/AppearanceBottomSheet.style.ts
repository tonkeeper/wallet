import styled from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';

export const Divider = styled.View`
  width: ${ns(12)}px;
`;

export const Description = styled(Text)`
  color: ${({ theme }) => theme.colors.foregroundSecondary};
  padding: 0 ${ns(16)}px;
  margin-bottom: ${ns(24)}px;
`;

export const ButtonContainer = styled.View`
  margin: ${ns(32)}px ${ns(16)}px 0 ${ns(16)}px;
`;
