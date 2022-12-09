import styled, { RADIUS } from '$styled';
import Animated from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { ns } from '$utils';
import { StatelessHighlight } from '$uikit';

export const Wrap = styled.View`
  flex: 1;
`;

export const HeaderWrap = styled.View`
  align-items: center;
  margin-bottom: ${ns(16)}px;
`;

export const ContentWrap = styled(Animated.View)`
  flex: 1;
  max-height: 100%;
  position: relative;
`;

export const Logo = styled(FastImage)`
  border-radius: ${ns(72 / 2)}px;
  width: ${ns(72)}px;
  height: ${ns(72)}px;
  margin-bottom: ${ns(16)}px;
  margin-top: ${ns(24)}px;
`;

export const JettonNameWrapper = styled.View`
  margin-bottom: ${ns(12)}px;
`;

export const JettonIDWrapper = styled.View`
  margin-bottom: ${ns(24)}px;
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

export const Action = styled.View<{ isLast?: boolean }>`
  margin-right: ${({ isLast }) => (!isLast ? ns(16) : 0)}px;
  flex: 1;
`;

export const ActionsContainer = styled.View`
  justify-content: space-between;
  flex-direction: row;
`;

export const ActionContentWrap = styled.View`
  justify-content: center;
  flex-direction: row;
  align-items: center;
`;

export const IconWrap = styled.View`
  margin-left: ${ns(-8)}px;
`;

export const ActionCont = styled(StatelessHighlight)`
  ${() => borders(true, true)}
  padding: ${ns(14)}px;
`;

export const ActionLabelWrapper = styled.View`
  margin-left: ${ns(12)}px;
`;

export const Background = styled.View<{ borderStart: boolean; borderEnd: boolean }>`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  ${({ borderStart, borderEnd }) => borders(borderStart, borderEnd)}
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;
