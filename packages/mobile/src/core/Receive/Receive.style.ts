import styled, { css } from '$styled';
import { nfs, ns } from '$utils';
import { Highlight } from '$uikit';
import { TabletModalsWidth, IsTablet } from '$shared/constants';

export const Wrap = styled.View`
  flex: 1;
`;

export const Header = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
`;

export const ContentWrap = styled.View`
  flex: 1;
  z-index: 1;
  ${() =>
    IsTablet &&
    css`
      align-items: center;
    `}
`;

export const Content = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingVertical: ns(32),
    paddingHorizontal: ns(48),
  },
  showsVerticalScrollIndicator: false,
  alwaysBounceVertical: false,
})`
  flex: 1;
  z-index: 1;
  ${() =>
    IsTablet &&
    css`
      width: ${TabletModalsWidth}px;
    `}
`;

export const Info = styled.View`
  align-items: center;
`;

export const TitleWrapper = styled.View`
  margin-top: ${ns(12)}px;
`;

export const QRBlockWrap = styled.View`
  margin-top: ${ns(24)}px;
  margin-bottom: ${ns(16)}px;
`;

export const Block = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
`;

export const BlockTitleWrapper = styled.View`
  margin-top: ${ns(16)}px;
  margin-horizontal: ${ns(16)}px;
`;

export const QRCodeWrap = styled.View.attrs({
  aspectRatio: 1,
})`
  padding: ${ns(16)}px;
`;

export const QRCode = styled.View<{ size: number }>`
  background: #fff;
  border-radius: 8px;
  height: ${({ size }) => size + ns(16 + 12)}px;
  width: ${({ size }) => size + ns(16 + 12)}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  position: relative;
`;

export const QRHelper = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: transparent;
  z-index: 2;
`;

export const AddressWrapper = styled.View`
  margin-top: ${ns(2)}px;
  margin-horizontal: ${ns(16)}px;
`;

export const Actions = styled.View`
  flex-direction: row;
  border-color: ${({ theme }) => theme.colors.border};
  border-top-width: ${ns(0.5)}px;
  margin-top: ${ns(15.5)}px;
`;

export const Action = styled(Highlight).attrs({
  contentViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})<{ skipBorder?: boolean }>`
  flex: 1;
  border-color: ${({ theme }) => theme.colors.border};
  border-right-width: ${({ skipBorder }) => (skipBorder ? 0 : ns(0.5))}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: ${ns(48)}px;
`;

export const ActionLabelWrapper = styled.View`
  margin-left: ${ns(8)}px;
`;

export const ReceivedContent = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${ns(32)}px;
`;
