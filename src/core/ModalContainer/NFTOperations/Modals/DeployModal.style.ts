import styled from '$styled';
import {hNs, nfs, ns} from '$utils';
import { Button } from '$uikit';

export const Wrap = styled.View`
  align-items: center;
  padding-horizontal: ${ns(32)}px;
  padding-top: ${ns(44)}px;
`;

export const TitleWrapper = styled.View`
  margin-top: ${ns(24)}px;
`;

export const CaptionWrapper = styled.View`
  margin-top: ${ns(4)}px;
`;

export const Buttons = styled.View`
  padding-horizontal: ${ns(16)}px;
  margin-top: ${ns(52)}px;
`;

export const ListWrap = styled.View`
  padding-horizontal: ${ns(16)}px;
`;

export const SendButton = styled(Button)`
  margin-top: ${ns(32)}px;
`;

export const Card = styled.View`
  margin-top: ${ns(16)}px;
  padding: ${ns(12)}px ${ns(16)}px ${ns(14)}px ${ns(16)}px;
`;

export const ContentWrap = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const TextWrap = styled.View`
  flex: 1;
  margin-right: ${hNs(14)}px;
`;

export const ChevronWrap = styled.View`
  padding-top: ${ns(1)}px;
  height: ${ns(20)}px;
  justify-content: center;
  align-items: center;
  margin-left: ${hNs(4)}px;
`;

export const DescriptionWrapper = styled.View`
  margin-bottom: ${ns(4)}px;
`;

export const LabelWrapper = styled.View`
  margin-bottom: ${ns(4)}px;
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
