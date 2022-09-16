import { StepScrollView } from '../../StepScrollView/StepScrollView';
import styled from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';

export const Container = styled(StepScrollView).attrs({
  contentContainerStyle: { paddingHorizontal: ns(16) },
})`
  flex: 1;
`;

export const TitleContainer = styled.View`
  align-items: center;
  margin-bottom: ${ns(48)}px;
`;

export const Title = styled(Text).attrs({
  variant: 'h2',
})`
  margin-bottom: ${ns(4)}px;
  text-align: center;
`;

export const SubTitle = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colors.foregroundSecondary};
`;
