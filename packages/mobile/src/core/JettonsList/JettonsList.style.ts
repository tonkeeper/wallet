import styled, { RADIUS } from '$styled';
import { hNs, nfs, ns } from '$utils';
import FastImage from 'react-native-fast-image';

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

export const Wrap = styled.View`
  flex: 1;
`;

export const JettonInner = styled.View<{ isFirst: boolean; isLast: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${ns(16)}px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  ${({ isFirst, isLast }) => borders(isFirst, isLast)}
`;

export const JettonCont = styled.View`
  flex: 1;
`;

export const JettonName = styled.Text.attrs({
  numberOfLines: 1,
})`
  font-family: ${({ theme }) => theme.font.medium};
  color: ${({ theme }) => theme.colors.foregroundPrimary};
  font-size: ${nfs(16)}px;
  line-height: 24px;
`;

export const JettonInfo = styled.Text.attrs({
  numberOfLines: 1,
})`
  font-family: ${({ theme }) => theme.font.regular};
  color: ${({ theme }) => theme.colors.foregroundSecondary};
  font-size: ${nfs(14)}px;
  line-height: 20px;
`;

export const BalanceWrapper = styled.View`
  margin-top: ${ns(2)}px;
`;

export const JettonLogo = styled(FastImage).attrs({
  resizeMode: 'stretch',
})`
  z-index: 2;
  height: ${ns(44)}px;
  width: ${hNs(44)}px;
  border-radius: ${ns(44 / 2)}px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  margin-right: ${ns(16)}px;
`;
