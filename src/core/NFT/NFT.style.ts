import styled, { RADIUS } from '$styled';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';

export const Wrap = styled.View`
  flex: 1;
`;

export const OnSaleText = styled.View`
  margin-top: ${ns(-4)}px;
  margin-bottom: ${ns(16)}px;
`;

export const TitleWrap = styled.View`
  margin-bottom: ${ns(8)}px;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;

export const ContentWrap = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;

export const Background = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const ButtonWrap = styled.View`
  margin-bottom: ${ns(30)}px;
`;

export const TextWrap = styled.View`
  z-index: 2;
  padding: ${ns(16)}px ${ns(16)}px ${ns(14)}px ${ns(16)}px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;
