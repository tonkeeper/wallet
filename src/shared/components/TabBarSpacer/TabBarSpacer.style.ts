import styled from '$styled';

export const Container = styled.View<{ marginBottom: number }>`
  margin-bottom: ${({ marginBottom }) => marginBottom}px;
`;
