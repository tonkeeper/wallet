import styled from '$styled';
import { Opacity } from '$shared/constants';
import { hNs, ns } from '$utils';
import { CurrencyIcon, Highlight } from '$uikit';

export const ManageJettons = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
  hitSlop: { bottom: 10, left: 8, right: 8, top: 10 },
})`
  margin-bottom: ${ns(16)}px;
  align-self: center;
`;

export const ManageJettonsWrap = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const AddOtherCoins = styled(Highlight).attrs({
  contentViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
})`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  height: ${hNs(56)}px;
  flex-direction: row;
  padding-horizontal: ${ns(16)}px;
  align-items: center;
  overflow: hidden;
  margin-bottom: ${ns(16)}px;
`;

export const AddOtherCoinsIcons = styled.View`
  flex-direction: row;
  flex: 0 0 auto;
`;

export const ItemDivider = styled.View`
  height: 16px;
`;

export const AddOtherCoinsIcon = styled(CurrencyIcon).attrs({
  size: 24,
})`
  margin-left: ${ns(-8)}px;
`;

export const AddOtherCoinsLabelWrapper = styled.View`
  margin-left: ${ns(12)}px;
  flex: 1;
`;

export const OldWalletBalanceCont = styled.View`
  flex: 1;
  flex-direction: row;
`;

export const OldWalletBalanceLabelWrapper = styled.View`
  margin-left: ${ns(12)}px;
`;

export const OldWalletBalanceCurrencyWrapper = styled.View`
  flex: 0 0 auto;
  margin-right: ${ns(16)}px;
`;

export const EventActionsGroup = styled.View<{ withSpacing: boolean }>`
  margin-bottom: ${({ withSpacing }) => ns(withSpacing ? 8 : 0)}px;
`;
