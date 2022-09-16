import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled.View`
  padding-vertical: ${ns(8)}px;
`;

export const Header = styled.View`
  padding-horizontal: ${ns(16)}px;
  height: ${ns(48)}px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

export const Indicator = styled.View`
  flex: 0 0 auto;
`;

export const DescriptionWrapper = styled.View<{ skipHorizontalPadding: boolean }>`
  margin-top: ${ns(12)}px;
  padding-horizontal: ${({ skipHorizontalPadding }) =>
    skipHorizontalPadding ? 0 : ns(16)}px;
`;

export const Content = styled.View<{
  skipHorizontalPadding: boolean;
  skipHorizontalContentPadding: boolean;
}>`
  width: 100%;
  padding-horizontal: ${({ skipHorizontalPadding, skipHorizontalContentPadding }) =>
    skipHorizontalPadding || skipHorizontalContentPadding ? 0 : ns(16)}px;
`;
