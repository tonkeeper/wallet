import styled from '$styled';
import { changeAlphaValue, convertHexToRGBA, hNs, ns } from '$utils';
import Animated from 'react-native-reanimated';

export const Container = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;

export const Form = styled.View`
  margin-top: -${ns(8)}px;
`;

export const Card = styled.View`
  margin: ${ns(16)}px;
  padding: ${ns(12)}px ${ns(16)}px ${ns(14)}px ${ns(16)}px;
`;

export const Background = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const ContentWrap = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const TextWrap = styled.View`
  flex: 1;
  margin-right: ${hNs(14)}px;
`;

export const LabelWrapper = styled.View`
  margin-bottom: ${ns(4)}px;
`;

export const DescriptionWrapper = styled.View`
  margin-bottom: ${ns(4)}px;
`;

export const ChevronWrap = styled.View`
  padding-top: ${ns(2)}px;
  height: ${ns(20)}px;
  justify-content: center;
  align-items: center;
  margin-left: ${hNs(4)}px;
`;

export const CommentExceededValue = styled.Text`
  background: ${({ theme }) =>
    changeAlphaValue(convertHexToRGBA(theme.colors.accentNegative), 0.32)};
`;

export const WarningIconWrapper = styled.View`
  margin-right: ${ns(2)}px;
`;
