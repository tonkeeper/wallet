import styled from '$styled';
import { changeAlphaValue, convertHexToRGBA } from '$utils';

export const CommentExceededValue = styled.Text`
  background: ${({ theme }) =>
    changeAlphaValue(convertHexToRGBA(theme.colors.accentNegative), 0.32)};
`;
