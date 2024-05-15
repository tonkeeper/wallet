import styled, { RADIUS } from '$styled';
import { Text } from '$uikit';
import { nfs, ns } from '$utils';
import { TouchableWithoutFeedback } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const getContainerTopOffset = (isFiatAvailable: boolean, withCoinSelector: boolean) => {
  const baseOffset = withCoinSelector ? 20 : 0;

  return ns(isFiatAvailable ? baseOffset + 4 : baseOffset);
};

export const SHADOW_INPUT_PADDING = 500;

export const InputTouchable = styled(TouchableWithoutFeedback)`
  flex: 1;
`;

export const InputContainer = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const AmountContainer = styled(Animated.View)<{
  isFiatAvailable: boolean;
  withCoinSelector: boolean;
}>`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 1000px;
  margin-top: ${({ isFiatAvailable, withCoinSelector }) =>
    getContainerTopOffset(isFiatAvailable, withCoinSelector)}px;
`;

export const FakeInputWrap = styled.View`
  position: relative;
`;

export const FakeInput = styled(Animated.Text)`
  font-size: ${nfs(40)}px;
  line-height: ${nfs(49)}px;
  font-family: ${({ theme }) => theme.font.medium};
  color: ${({ theme }) => theme.colors.foregroundPrimary};
  text-align-vertical: center;
`;

export const AmountInput = styled(TextInput)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: ${nfs(40)}px;
  line-height: ${nfs(49)}px;
  padding: 0;
  padding-right: ${SHADOW_INPUT_PADDING}px;
  width: ${SHADOW_INPUT_PADDING * 2}px;
  transform: translateX(${SHADOW_INPUT_PADDING}px);
  font-family: ${({ theme }) => theme.font.medium};
  max-width: 10000px;
  text-align: right;
  color: transparent;
`;

export const AmountCode = styled(Text).attrs({
  variant: 'label1',
})`
  margin-left: ${ns(8)}px;
  color: ${({ theme }) => theme.colors.foregroundSecondary};
  font-size: ${nfs(28)}px;
  line-height: ${nfs(34)}px;
  margin-top: ${ns(9)}px;
`;

export const Error = styled(Text).attrs({
  variant: 'body2',
  color: 'accentNegative',
})``;

export const SendAllContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${ns(16)}px;
`;

export const SandAllLabel = styled(Text).attrs({
  variant: 'body2',
  color: 'foregroundSecondary',
  numberOfLines: 1,
  textAlign: 'right',
})`
  flex: 1;
`;

export const SecondaryAmountContainer = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6,
})`
  padding: ${ns(6.5)}px ${ns(14.5)}px;
  border: 1.5px solid ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${ns(100)}px;
  margin-top: ${ns(8)}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const SwapButtonContainer = styled.View`
  position: absolute;
  top: ${ns(16)}px;
  right: ${ns(16)}px;
`;
