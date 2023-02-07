import styled, { css } from '$styled';
import { hNs, nfs, ns } from '$utils';
import appLogo from '$assets/settings_logo.svg';
import { IsTablet, TabletMaxWidth } from '$shared/constants';
import { View } from 'react-native';

export const Wrap = styled.View`
  flex: 1;
`;

// Special width for tablets or big devices
export const Content = styled(View)`
  ${() =>
    IsTablet &&
    css`
      width: ${TabletMaxWidth}px;
    `}
`;

export const AppInfo = styled.View`
  padding: ${ns(0)}px ${ns(32)}px ${ns(8)}px;
  align-items: center;
`;

export const AppInfoIcon = styled(appLogo)`
  width: ${ns(32)}px;
  height: ${ns(32)}px;
`;

export const AppInfoTitleWrapper = styled.View`
  margin-top: ${ns(8)}px;
`;

export const AppInfoVersionWrapper = styled.View`
  margin-top: ${hNs(2)}px;
`;

export const PopupTextWrapper = styled.View`
  margin-left: ${ns(8)}px;
`;

export const SelectedCurrency = styled.Text`
  font-family: ${({ theme }) => theme.font.medium};
  color: ${({ theme }) => theme.colors.accentPrimary};
  font-size: ${nfs(16)}px;
  line-height: 24px;
`;

export const NotificationDeniedIndicator = styled.View`
  background-color: ${({ theme }) => theme.colors.accentNegative};
  width: ${ns(8)}px;
  height: ${ns(8)}px;
  border-radius: ${ns(4)}px;
  position: relative;
  left: 8px;
  top: 1px;
`;

export const WalletVersion = styled.View`
  flex-direction: row;
`;
