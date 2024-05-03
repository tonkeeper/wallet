import { Opacity } from '$shared/constants';
import styled from '$styled';
import { Icon, Skeleton, Text } from '$uikit';
import { ns } from '$utils';
import { TouchableOpacity } from 'react-native-gesture-handler';

const NAVBAR_HEIGHT = 64;

const NAVBAR_BUTTONS_WIDTH = 81;

export const Container = styled.View<{ topOffset: number }>`
  padding: ${ns(8)}px ${ns(16)}px;
  margin-top: ${({ topOffset }) => topOffset}px;
  flex-direction: row;
  align-items: center;
  height: ${ns(NAVBAR_HEIGHT)}px;
  position: relative;
`;

export const Title = styled(Text).attrs({
  variant: 'h3',
  numberOfLines: 1,
})``;

export const TitleSkeleton = styled(Skeleton.Line).attrs({ width: 100, height: 28 })``;

export const SubTitleRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const SecureIcon = styled(Icon).attrs({
  name: 'ic-lock-12',
  color: 'foregroundTertiary',
})`
  margin-top: ${ns(3)}px;
  margin-right: ${ns(4)}px;
`;

export const ConnectedIcon = styled(Icon).attrs({
  name: 'ic-dot-12',
  color: 'accentPrimary',
})`
  margin-top: ${ns(2)}px;
  margin-right: ${ns(4)}px;
`;

export const SubTitle = styled(Text).attrs({
  variant: 'body2',
  color: 'foregroundSecondary',
  numberOfLines: 1,
})``;

export const MiddleContainer = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForLarge,
})`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin: 0 ${ns(8)}px;
`;

export const LeftContainer = styled.View`
  width: ${ns(NAVBAR_BUTTONS_WIDTH)}px;
  flex-direction: row;
  justify-content: flex-start;
`;

export const RightContainer = styled.View`
  width: ${ns(NAVBAR_BUTTONS_WIDTH)}px;
  flex-direction: row;
  justify-content: flex-end;
`;

export const ActionsContainer = styled.View`
  flex-direction: row;
  flex: 1;
  height: ${ns(32)}px;
  background: ${({ theme }) => theme.colors.buttonSecondaryBackground};
  border-radius: ${ns(16)}px;
  overflow: hidden;
`;

export const ActionItem = styled.View`
  flex: 1;
`;

export const ActionItemTouchable = styled(TouchableOpacity).attrs({
  activeOpacity: Opacity.ForSmall,
})`
  width: 100%;
  height: 100%;
`;

export const ActionItemContent = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const ActionsDivider = styled.View`
  width: 1px;
  margin: ${ns(8)}px 0;
  background: ${({ theme }) => theme.colors.separatorCommon};
`;

export const BackButtonTouchable = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})``;

export const BackButton = styled.View`
  background: ${({ theme }) => theme.colors.buttonSecondaryBackground};
  width: ${ns(32)}px;
  height: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  align-items: center;
  justify-content: center;
`;
