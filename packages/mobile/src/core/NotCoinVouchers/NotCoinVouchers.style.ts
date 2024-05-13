import styled, { RADIUS } from '$styled';
import Animated from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { deviceWidth, ns } from '$utils';
import { TouchableOpacity } from 'react-native';
import { Opacity } from '$shared/constants';

export const Wrap = styled.View`
  flex: 1;
`;

export const ChartWrap = styled.View`
  margin-bottom: ${ns(24.5)}px;
`;

export const HeaderWrap = styled.View`
  align-items: center;
`;

export const ContentWrap = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;

export const Logo = styled(FastImage)`
  border-radius: ${ns(64 / 2)}px;
  width: ${ns(64)}px;
  height: ${ns(64)}px;
  margin-left: ${ns(16)}px;
`;

export const JettonNameWrapper = styled.View`
  margin-bottom: ${ns(12)}px;
`;

export const JettonIDWrapper = styled.View`
  margin-top: ${ns(12)}px;
`;

export const FlexRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${ns(16)}px;
  padding-horizontal: ${ns(12)}px;
`;

export const JettonAmountWrapper = styled.View`
  flex: 1;
`;

const borders = (borderStart: boolean, borderEnd: boolean) => {
  return `
    ${
      borderStart
        ? `
        border-top-left-radius: ${ns(RADIUS.normal)}px;
        border-top-right-radius: ${ns(RADIUS.normal)}px;
      `
        : ''
    }
  ${
    borderEnd
      ? `
        border-bottom-left-radius: ${ns(RADIUS.normal)}px;
        border-bottom-right-radius: ${ns(RADIUS.normal)}px;
      `
      : ''
  }
  `;
};

export const Divider = styled.View`
  height: ${ns(0.5)}px;
  width: ${deviceWidth}px;
  background: rgba(79, 90, 112, 0.24);
  margin-bottom: ${ns(24)}px;
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

export const ActionsContainer = styled.View`
  justify-content: center;
  flex-direction: row;
  margin-bottom: ${ns(12)}px;
`;

export const IconWrap = styled.View``;

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
