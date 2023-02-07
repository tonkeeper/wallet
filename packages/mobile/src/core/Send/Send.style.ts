import styled, { css } from '$styled';
import { nfs, ns } from '$utils';
import { Opacity } from '$shared/constants';
import Animated from 'react-native-reanimated';

export const Wrap = styled.View`
  flex: 1;
`;

export const ContentWrap = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;

export const AmountFormWrap = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const AmountForm = styled.View`
  position: relative;
  height: ${ns(112)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  padding: ${ns(24)}px ${ns(32)}px;
  align-items: center;
`;

export const AmountFormDecoration = styled.View<{ isRightSide?: boolean }>`
  width: ${ns(32)}px;
  height: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  position: absolute;
  top: ${ns(40)}px;
  ${({ isRightSide }) => (isRightSide ? 'right' : 'left')}: ${ns(-16)}px;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
`;

const InputStyle = css`
  font-size: ${nfs(32)}px;
  line-height: 40px;
  font-family: ${({ theme }) => theme.font.semiBold};
  height: ${ns(40)}px;
  text-align: center;
  width: 100%;
  padding: 0;
`;

export const AmountFormInput = styled.TextInput`
  ${InputStyle};
  color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const AmountFormInputWrap = styled.View`
  position: relative;
  width: 100%;
`;

export const AmountFormInputPlaceholder = styled.TextInput`
  ${InputStyle};
  color: ${({ theme }) => theme.colors.foregroundPrimary};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

export const AmountFormLabelWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const ScanQRButton = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})`
  padding: ${ns(12)}px ${ns(16)}px;
  margin-right: ${ns(-16)}px;
`;

export const ButtonWrap = styled.View`
  padding-top: ${ns(16)}px;
  padding-horizontal: ${ns(16)}px;
`;
