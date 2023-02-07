import styled, { RADIUS } from '$styled';
import { hNs, nfs, ns } from '$utils';
import { Highlight, Text } from '$uikit';

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

export const Background = styled.View<{ borderStart: boolean; borderEnd: boolean }>`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  ${({ borderStart, borderEnd }) => borders(borderStart, borderEnd)}
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const Wrap = styled(Highlight)<{ borderStart: boolean; borderEnd: boolean }>`
  ${({ borderStart, borderEnd }) => borders(borderStart, borderEnd)}
  z-index: 2;
  overflow: hidden;
`;

export const ContWrap = styled.View`
  flex-direction: row;
  padding: ${ns(16)}px ${hNs(16)}px;
`;

export const Icon = styled.View`
  width: ${ns(44)}px;
  height: ${hNs(44)}px;
  border-radius: ${ns(44 / 2)}px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  align-items: center;
  justify-content: center;
`;

export const Cont = styled.View`
  margin-left: ${ns(16)}px;
  flex: 1;
`;

export const Item = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const Group = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const LargeText = styled(Text).attrs({
  ellipsizeMode: 'tail',
  numberOfLines: 1,
  variant: 'label1',
})``;

export const Left = styled.View`
  margin-right: ${hNs(16)}px;
  flex: 1;
`;

export const SmallText = styled(Text).attrs({
  color: 'foregroundSecondary',
  variant: 'body2',
})``;

export const Comment = styled.View`
  margin-top: ${hNs(8)}px;
  padding: ${ns(8)}px ${hNs(12)}px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => ns(theme.radius.large)}px;
  align-self: flex-start;
`;

export const Sending = styled.View`
  background: ${({ theme }) => theme.colors.foregroundSecondary};
  border-radius: ${ns(16 / 2)}px;
  height: ${hNs(16)}px;
  width: ${hNs(16)}px;
  position: absolute;
  bottom: 0px;
  right: 0px;
`;
