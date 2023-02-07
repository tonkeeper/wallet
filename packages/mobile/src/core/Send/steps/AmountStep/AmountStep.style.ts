import styled, { RADIUS } from '$styled';
import { Text } from '$uikit';
import { nfs, ns } from '$utils';
import { TouchableWithoutFeedback } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

export const SHADOW_INPUT_PADDING = 500;

export const Container = styled(Animated.View)<{ bottomInset: number }>`
  flex: 1;
  max-height: 100%;
  padding: 0 ${ns(16)}px ${({ bottomInset }) => bottomInset + ns(16)}px ${ns(16)}px;
`;

export const InputTouchable = styled(TouchableWithoutFeedback)`
  flex: 1;
`;

export const InputContainer = styled.View`
  flex: 1;
  margin: ${ns(16)}px 0;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const AmountContainer = styled(Animated.View)<{ isFiatAvailable: boolean }>`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 1000px;
  margin-top: ${({ isFiatAvailable }) => ns(isFiatAvailable ? 4 : 0)}px;
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
})`
  position: absolute;
  bottom: ${ns(16)}px;
  left: ${ns(16)}px;
  right: ${ns(16)}px;
  text-align: center;
`;

export const SendAllContainer = styled.View`
  height: ${ns(35)}px;
  flex-direction: row;
  align-items: center;
  margin-bottom: ${ns(16)}px;
`;

export const SandAllLabel = styled(Text).attrs({
  variant: 'body1',
  color: 'foregroundSecondary',
  numberOfLines: 1,
})`
  flex: 1;
  margin-left: ${ns(16)}px;
  margin-top: -${ns(1)}px;
`;

export const SecondaryAmountContainer = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6,
})`
  padding: ${ns(6.5)}px ${ns(14.5)}px;
  border: 1.5px solid ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${ns(100)}px;
  margin-top: ${ns(8)}px;
`;

export const SwapButtonContainer = styled.View`
  position: absolute;
  top: ${ns(16)}px;
  right: ${ns(16)}px;
`;
