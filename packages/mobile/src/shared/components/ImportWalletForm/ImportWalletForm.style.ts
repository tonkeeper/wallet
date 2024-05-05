import Animated from 'react-native-reanimated';
import styled from '$styled';
import { isAndroid, nfs, ns } from '$utils';
import { Text } from '$uikit';

export const INPUT_HEIGHT = ns(56);

export const InputWrap = styled.View`
  margin-top: ${ns(16)}px;
  position: relative;
`;

export const InputNumber = styled.TextInput.attrs({
  editable: false,
  scrollEnabled: false,
  allowFontScaling: false,
})`
  font-family: ${({ theme }) => theme.font.regular};
  font-size: ${ns(16)}px;
  color: ${({ theme }) => theme.colors.foregroundSecondary};
  margin: 0;
  text-align: right;
  border-width: 0;
  width: ${ns(28)}px;
  left: ${ns(16)}px;
  top: 0;
  padding-left: 0;
  padding-right: 0;
  padding-top: ${ns(isAndroid ? 16.5 : 18.5)}px;
  padding-bottom: ${ns(isAndroid ? 16 : 17.5)}px;
  ${isAndroid ? 'text-align-vertical: top;' : ''}
  z-index: 3;
  position: absolute;
  ${() => {
    if (isAndroid) {
      return `
      line-height: ${ns(24)}px;
      `;
    }
  }}
`;

export const ButtonWrap = styled.View`
  margin-top: ${ns(32)}px;
`;

export const Header = styled.View`
  align-items: center;
  padding-bottom: ${ns(16)}px;
`;

export const HeaderCaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const HINTS_MAX_HEIGHT = ns(197);

export const Container = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;

export const WordHintsWrap = styled(Animated.View)`
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  margin-horizontal: ${ns(30)}px;
  border-radius: ${ns(16)}px;
  box-shadow: 0px ${ns(8)}px ${ns(32)}px rgba(0, 0, 0, 0.16);
  min-width: ${ns(160)}px;
  max-height: ${HINTS_MAX_HEIGHT}px;
  min-height: ${ns(50)}px;
  overflow: hidden;
`;

export const WordHintsContent = styled.View`
  overflow: hidden;
  border-radius: ${ns(16)}px;
`;

export const WordHintsItem = styled.View`
  height: ${ns(48)}px;
  flex-direction: row;
  padding-horizontal: ${ns(16)}px;
  align-items: center;
`;

export const HeaderTitle = styled.Text.attrs({ allowFontScaling: false })`
  font-family: ${({ theme }) => theme.font.semiBold};
  color: ${({ theme }) => theme.colors.foregroundPrimary};
  font-size: ${nfs(24)}px;
  line-height: ${nfs(32)}px;
  text-align: center;
`;
