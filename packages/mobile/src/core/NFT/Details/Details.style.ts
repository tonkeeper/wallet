import styled from '$styled';
import { ns } from '$utils';
import { Text } from '$uikit';
import { Opacity } from '$shared/constants';

export const TitleWrapper = styled.View`
  margin-bottom: ${ns(14)}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const OpenInExplorerButton = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})`
  padding: 0 ${ns(16)}px;
  margin-right: ${ns(-16)}px;
`;

export const Container = styled.View`
  flex: 1;
  margin-bottom: ${ns(16)}px;
`;

export const Table = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
`;

export const Item = styled.View`
  padding: ${ns(16)}px;
  flex-direction: row;
  overflow: hidden;
`;

export const ItemLabelWrapper = styled.View`
  width: ${ns(150)}px;
  flex: 0 0 auto;
`;

export const ItemValue = styled(Text).attrs(() => ({
  variant: 'body1',
  textAlign: 'right',
}))`
  margin-left: ${ns(10)}px;
  flex: 1;
`;
