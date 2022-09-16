import styled, { RADIUS } from '$styled';
import { hNs, nfs, ns } from '$utils';
import { Highlight } from '$uikit';

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

export const Wrap = styled(Highlight)<{ borderStart: boolean; borderEnd: boolean }>`
  overflow: hidden;
  z-index: 2;
  ${({ borderStart, borderEnd }) => borders(borderStart, borderEnd)}
`;

export const Cont = styled.View`
  overflow: hidden;
  flex-direction: row;
  align-items: center;
  padding: ${ns(16)}px ${hNs(16)}px;
`;

export const IconWrap = styled.View`
  flex: 0 0 auto;
  position: relative;
  width: ${ns(44)}px;
  height: ${ns(44)}px;
`;

export const LockBadge = styled.View`
  position: absolute;
  bottom: ${ns(-1)}px;
  right: ${ns(-1)}px;
  width: ${ns(18)}px;
  height: ${ns(18)}px;
  border: ${ns(2)}px solid ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(18 / 2)}px;
  background: ${({ theme }) => theme.colors.foregroundSecondary};
  align-items: center;
  justify-content: center;
`;

export const Info = styled.View`
  flex: 1;
  margin-left: ${ns(16)}px;
  flex-direction: row;
`;

export const CryptoInfo = styled.View`
  flex: 1;
`;

export const FiatInfo = styled.View`
  align-items: flex-end;
`;

export const Actions = styled.View`
  flex-direction: row;
  flex: 0 0 auto;
  margin-top: ${ns(12)}px;
`;

export const Action = styled.View<{ isLast?: boolean }>`
  margin-right: ${({ isLast }) => (!isLast ? ns(12) : 0)}px;
  flex: 1;
`;

export const ActionCont = styled(Highlight)`
  ${() => borders(true, true)}
  flex: 0 0 auto;
  height: ${ns(84)}px;
  padding: ${ns(16)}px 0 ${ns(16)}px ${ns(16)}px;
`;

export const ActionLabelWrapper = styled.View`
  margin-top: ${ns(8)}px;
`;

export const ChartWrap = styled.View`
  padding: ${ns(16)}px ${hNs(16)}px;
`;

export const ChartDates = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 0 ${hNs(16)}px ${ns(12)}px;
`;

export const ChartDatesItem = styled.View``;

export const Background = styled.View<{ borderStart: boolean; borderEnd: boolean }>`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  ${({ borderStart, borderEnd }) => borders(borderStart, borderEnd)}
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const Container = styled.View``;
