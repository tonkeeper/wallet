import styled from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';

export const Label = styled(Text).attrs({ variant: 'label1' })`
  padding: ${ns(14)}px 0;
`;
