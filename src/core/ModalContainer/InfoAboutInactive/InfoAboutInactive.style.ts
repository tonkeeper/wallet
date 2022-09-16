import styled from '$styled';
import { ns, nfs } from '$utils';
import { Text as UIText } from '$uikit';

export const Wrap = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const Text = styled(UIText).attrs({
  color: 'foregroundSecondary',
  variant: 'body1',
})`
  margin-bottom: ${ns(12)}px;
`;

export const TextBold = styled(UIText).attrs({
  color: 'foregroundPrimary',
  variant: 'body1',
  fontWeight: '600',
})``;
