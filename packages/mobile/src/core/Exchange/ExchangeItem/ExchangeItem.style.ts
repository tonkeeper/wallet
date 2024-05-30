import FastImage from 'react-native-fast-image';

import styled from '$styled';
import { Badge as UIBadge } from '$uikit';
import { hNs, ns } from '$utils';

export const Wrap = styled.View`
  position: relative;
`;

export const CardIn = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Divider = styled.View`
  height: ${ns(0.5)}px;
  background: ${({ theme }) => theme.colors.border};
  margin-left: ${ns(16)}px;
`;

export const Icon = styled(FastImage).attrs({
  resizeMode: 'cover',
  priority: FastImage.priority.high,
})`
  width: ${ns(44)}px;
  height: ${hNs(44)}px;
  border-radius: ${ns(12)}px;
  margin-right: ${ns(16)}px;
`;

export const Contain = styled.View`
  flex: 1;
  margin-right: ${ns(16)}px;
`;

export const LabelContainer = styled.View`
  flex-direction: row;
`;

export const LabelBadge = styled(UIBadge)`
  margin-left: ${ns(4)}px;
`;

export const IconContain = styled.View``;

export const Badge = styled.View`
  padding: ${hNs(4)}px ${ns(8)}px;
  background: ${({ theme }) => theme.colors.accentPrimary};
  border-radius: ${ns(8)}px;
  position: absolute;
  top: ${hNs(16 + 8)}px;
  right: ${ns(3)}px;
  z-index: 3;
`;
