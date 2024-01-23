import FastImage from 'react-native-fast-image';

import styled, { RADIUS } from '$styled';
import { Badge as UIBadge, Pressable } from '$uikit';
import { hNs, nfs, ns } from '$utils';

export const Wrap = styled.View`
  position: relative;
`;

const radius = (topRadius: boolean, bottomRadius: boolean) => {
  return `
    ${
      topRadius
        ? `
        border-top-left-radius: ${ns(RADIUS.normal)}px;
        border-top-right-radius: ${ns(RADIUS.normal)}px;
      `
        : ''
    }
  ${
    bottomRadius
      ? `
        border-bottom-left-radius: ${ns(RADIUS.normal)}px;
        border-bottom-right-radius: ${ns(RADIUS.normal)}px;
      `
      : ''
  }
  `;
};

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

export const AssetsContainer = styled.View`
  flex-direction: row;
  margin-top: ${ns(4)}px;
  margin-left: -${ns(2)}px;
`;

export const Asset = styled.View`
  width: ${ns(28)}px;
  height: ${ns(28)}px;
  border-radius: ${ns(28) / 2}px;
  border-width: ${ns(2)}px;
  border-color: ${({ theme }) => theme.colors.backgroundSecondary};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  margin-right: -${ns(8)}px;
  overflow: hidden;
`;

export const AssetImage = styled.Image`
  width: ${ns(24)}px;
  height: ${ns(24)}px;
`;

export const AssetsCount = styled.View`
  height: ${ns(24)}px;
  border-radius: ${ns(24) / 2}px;
  padding: 0 ${ns(8)}px;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  margin-left: ${ns(14)}px;
  margin-top: ${ns(2)}px;
`;
