import styled from '$styled';
import { nfs, ns } from '$utils';
import {Text} from "$uikit";

export const Wrap = styled.View``;

export const Header = styled.View`
  align-items: center;
  padding: ${ns(32)}px ${ns(64)}px;
`;

export const NameWrapper = styled.View`
  margin-top: ${ns(2)}px;
`;

export const Content = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const Info = styled.View`
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const InfoCell = styled.View`
  flex-direction: row;
  align-items: center;
  height: ${ns(56)}px;
  position: relative;
  padding-horizontal: ${ns(16)}px;
`;

export const InfoCellLabel = styled(Text).attrs({
  color: 'foregroundSecondary',
  variant: 'body1',
})`
  flex: 1;
`;

export const InfoCellValue = styled(Text).attrs({
  variant: 'label1',
})`
  margin-left: ${ns(16)}px;
  flex: 0 0 auto;
`;

export const ButtonWrap = styled.View`
  margin-top: ${ns(32)}px;
`;

export const SuccessWrap = styled.View`
  align-items: center;
  padding-horizontal: ${ns(32)}px;
  padding-top: ${ns(44)}px;
`;

export const SuccessIcon = styled.Image.attrs({
  resizeMode: 'cover',
})`
  width: ${ns(72)}px;
  height: ${ns(72)}px;
  border-radius: ${ns(72 / 2)}px;
`;

export const SuccessTitleWrapper = styled.View`
  margin-top: ${ns(24)}px;
`;

export const SuccessCaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const SuccessButtons = styled.View`
  padding-horizontal: ${ns(16)}px;
  margin-top: ${ns(52)}px;
`;
