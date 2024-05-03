import { Opacity } from '$shared/constants';
import styled from '$styled';
import { deviceWidth, ns } from '$utils';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const Wrap = styled.View`
  flex: 1;
`;

export const Header = styled.View`
  margin-horizontal: ${ns(-16)}px;
`;

export const ActionsWrap = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const TokenInfoWrap = styled.View`
  align-items: center;
  padding-horizontal: ${ns(28)}px;
`;

export const ChartWrap = styled.View`
  margin-bottom: ${ns(24.5)}px;
`;

export const FlexRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${ns(16)}px;
`;

export const ExploreButtons = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: ${ns(10)}px;
`;

export const Info = styled.View`
  align-items: center;
  padding-horizontal: ${ns(32)}px;
`;

export const ExploreWrap = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const AmountWrapper = styled.View`
  flex: 1;
`;

export const AboutWrapper = styled.View`
  margin-top: ${ns(12)}px;
`;

export const Price = styled.View`
  flex-direction: row;
  margin-top: ${ns(12)}px;
`;

export const ActionsContainer = styled.View`
  justify-content: center;
  flex-direction: row;
  margin-bottom: ${ns(12)}px;
`;

export const IconWrapper = styled.View`
  background-color: #0088cc;
  width: ${ns(64)}px;
  height: ${ns(64)}px;
  border-radius: ${ns(64 / 2)}px;
  align-items: center;
  justify-content: center;
  margin-left: ${ns(16)}px;
`;

export const Divider = styled.View`
  height: ${ns(0.5)}px;
  width: ${deviceWidth}px;
  background: ${({ theme }) => theme.colors.separatorCommon};
  margin-bottom: ${ns(24)}px;
`;

export const FiatInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${ns(2)}px;
`;

export const FiatAmountWrapper = styled.View`
  margin-right: ${ns(4)}px;
`;

export const Actions = styled.View`
  margin-top: ${ns(16)}px;
  flex-direction: row;
  padding-right: ${ns(16)}px;
`;

export const ActionIcon = styled.View`
  border-radius: ${ns(48 / 2)}px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  margin-bottom: ${ns(8)}px;
  width: ${ns(44)}px;
  height: ${ns(44)}px;
  align-items: center;
  justify-content: center;
`;

export const Action = styled(TouchableOpacity).attrs({
  activeOpacity: 0.6,
  hitSlop: { top: 12, bottom: 12, left: 12, right: 12 },
})`
  align-items: center;
`;

export const ActionWrapper = styled.View<{ isLast?: boolean }>`
  margin-right: ${({ isLast }) => (!isLast ? ns(25.5) : 0)}px;
  align-items: center;
  justify-content: center;
`;

export const ActionLabelWrapper = styled.View`
  margin-top: ${ns(2)}px;
`;

export const HeaderViewDetailsButton = styled(TouchableOpacity).attrs({
  activeOpacity: Opacity.ForSmall,
  hitSlop: { top: 20, left: 20, right: 20, bottom: 20 },
})`
  width: ${ns(32)}px;
  height: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.buttonSecondaryBackground};
`;
