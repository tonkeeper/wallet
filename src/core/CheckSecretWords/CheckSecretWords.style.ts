import styled from '$styled';
import {isAndroid, nfs, ns} from '$utils';

export const Inputs = styled.View`
  padding-vertical: ${ns(32)}px;
`;

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
  padding-top: ${ns(isAndroid ? 19 : 17.5)}px;
  padding-bottom: ${ns(isAndroid ? 15 : 17.5)}px;
  ${isAndroid ? 'text-align-vertical: top;' : ''}
  z-index: 3;
  position: absolute;
`;

export const HeaderTitle = styled.Text.attrs({ allowFontScaling: false })`
  font-family: ${({ theme }) => theme.font.semiBold};
  color: ${({ theme }) => theme.colors.foregroundPrimary};
  font-size: ${nfs(24)}px;
  line-height: ${nfs(32)}px;
  text-align: center;
`;