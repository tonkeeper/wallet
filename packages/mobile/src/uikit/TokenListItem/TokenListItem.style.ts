import styled, { RADIUS } from '$styled';
import { Highlight } from '../Highlight/Highlight';
import { ns } from '$utils';

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

export const Jetton = styled(Highlight)<{ isFirst: boolean; isLast: boolean }>`
  ${({ isFirst, isLast }) => borders(isFirst, isLast)}
  z-index: 2;
`;

export const JettonWrap = styled.View<{ withMargin?: boolean; bottomOffset?: number }>`
  ${({ withMargin, bottomOffset }) =>
    withMargin && `margin-bottom: ${ns(bottomOffset ?? 12)}px;`}
`;

export const Background = styled.View<{ borderStart: boolean; borderEnd: boolean }>`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  ${({ borderStart, borderEnd }) => borders(borderStart, borderEnd)}
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const JettonContent = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${ns(16)}px;
`;

export const JettonTextWrap = styled.View`
  margin-left: ${ns(16)}px;
  flex: 1;
`;

export const AddOtherCoinsIcons = styled.View`
  flex-direction: row;
  flex: 0 0 auto;
`;
