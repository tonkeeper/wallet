import styled, { RADIUS } from '$styled';
import { Highlight } from '$uikit';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const SHADOW_INPUT_PADDING = 500;

export const Container = styled(Animated.View)<{ bottomInset: number }>`
  flex: 1;
  max-height: 100%;
  padding: 0 ${ns(16)}px ${({ bottomInset }) => bottomInset + ns(16)}px ${ns(16)}px;
`;

export const AmountContainer = styled.View`
  flex: 1;
  position: relative;
`;

export const CoinContainer = styled.View`
  position: absolute;
  top: ${ns(16)}px;
  left: ${ns(64)}px;
  right: ${ns(64)}px;
  align-items: center;
`;

export const CoinButtonContainer = styled.View`
  border-radius: ${ns(24)}px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  overflow: hidden;
  margin-bottom: ${ns(8)}px;
`;

export const CoinButton = styled(Highlight).attrs({
  useRNGHComponent: true,
})`
  position: relative;
`;

export const CoinButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${ns(8)}px ${ns(16)}px;
`;

export const CoinButtonChevron = styled.View`
  margin-left: ${ns(6)}px;
  margin-right: -${ns(4)}px;
`;
