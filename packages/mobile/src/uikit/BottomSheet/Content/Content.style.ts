import { View } from 'react-native';

import styled, {css} from '$styled';
import { ns } from '$utils';
import {TabletModalsWidth, IsTablet} from "$shared/constants";

export const ContentWrap = styled(View)<{ skipHeader: boolean }>`
  /**
   * use padding top with 1px because bottom sheet
   * header has -1px margin
   */
  ${() => IsTablet && css`align-items: center`}
  padding-top: ${ns(1)}px;
  background-color: ${({ theme }) => theme.colors.backgroundPrimary};
  ${({ skipHeader, theme }) =>
          skipHeader
                  ? `
        border-top-left-radius: ${ns(theme.radius.large)}px;
        border-top-right-radius: ${ns(theme.radius.large)}px;
      `
                  : ''}
`;

// Special width for tablets or big devices
export const Content = styled(View)<{ skipHeader: boolean }>`
  ${() => IsTablet && css`width: ${TabletModalsWidth}px`}
`;

export const PseudoElement = styled(View)<{ skipHeader: boolean }>`
  height: 500%;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  background-color: ${({ theme }) => theme.colors.backgroundPrimary};
  ${({ skipHeader, theme }) =>
    skipHeader
      ? `
        border-top-left-radius: ${ns(theme.radius.large)}px;
        border-top-right-radius: ${ns(theme.radius.large)}px;
      `
      : ''}
`;
