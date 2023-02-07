import styled, { RADIUS } from '$styled';
import { Text } from '$uikit';
import { ns } from '$utils';

export const Container = styled.View<{ bottomInset: number }>`
  flex: 1;
  max-height: 100%;
  padding: 0 ${ns(32)}px ${({ bottomInset }) => bottomInset + ns(32)}px ${ns(32)}px;
`;

export const ContentContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Title = styled(Text).attrs({ variant: 'h2' })`
  margin-top: ${ns(12)}px;
  text-align: center;
`;

export const Description = styled(Text).attrs({
  variant: 'body1',
  color: 'foregroundSecondary',
})`
  margin-top: ${ns(8)}px;
  text-align: center;
`;

export const DetailsContainer = styled.View`
  margin-top: ${ns(32)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  padding: ${ns(36)}px ${ns(16)}px;
  width: 100%;
  align-items: center;
`;

export const Amount = styled(Text).attrs({ variant: 'h2' })`
  margin-bottom: ${ns(8)}px;
  text-align: center;
`;

export const DetailsText = styled(Text).attrs({
  variant: 'body1',
  color: 'foregroundSecondary',
})`
  text-align: center;
`;

export const AddToFavoritesContainer = styled.View`
  margin-top: ${ns(16)}px;
  width: 100%;
`;
