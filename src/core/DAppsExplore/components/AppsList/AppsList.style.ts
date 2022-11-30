import styled from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';

const MORE_ICON_SIZE = 40;

export const Container = styled.View`
  padding: 0 ${ns(12)}px;
`;

export const Title = styled(Text).attrs({ variant: 'h3' })`
  padding: ${ns(14)}px ${ns(4)}px;
`;

export const List = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const MoreIconContainer = styled.View`
  align-items: center;
  justify-content: center;
  width: ${ns(MORE_ICON_SIZE)}px;
  height: ${ns(MORE_ICON_SIZE)}px;
  border-radius: ${ns(MORE_ICON_SIZE / 2)}px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
`;
