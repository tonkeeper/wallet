import styled, { css, RADIUS } from '$styled';
import { hNs, nfs, ns } from '$utils';
import { CurrencyIcon, Highlight } from '$uikit';
import FastImage from 'react-native-fast-image';
import { IsTablet, Opacity, TabletMaxWidth } from '$shared/constants';
import { View } from 'react-native';

export const Wrap = styled.View`
  flex: 1;
`;

export const ListSectionsSpacer = styled.View`
  height: ${hNs(16)}px;
`;

export const LoaderWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const LoaderMoreWrap = styled.View`
  align-items: center;
  margin-top: ${ns(24)}px;
  margin-bottom: ${ns(8)}px;
`;

export const CreateWalletButtonHelper = styled.View`
  height: ${hNs(56 + 16)}px;
  flex: 0 0 auto;
`;

export const CreateWalletButtonWrap = styled.View`
  padding: ${ns(16)}px ${hNs(16)}px;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  ${() =>
    IsTablet &&
    css`
      align-items: center;
    `}
`;

// Special width for tablets or big devices
export const CreateWalletButtonContainer = styled(View)<{ skipHeader: boolean }>`
  ${() =>
    IsTablet &&
    css`
      width: ${TabletMaxWidth}px;
    `}
`;

export const BottomSpace = styled.View`
  height: ${hNs(16)}px;
`;
