import { IsTablet } from '$shared/constants';
import styled, { RADIUS } from '$styled';
import { ns } from '$utils';
import { TextInput } from 'react-native';

const INPUT_HEIGHT = 48;

export const Container = styled.View`
  padding: ${ns(16)}px ${ns(IsTablet ? 0 : 16)}px;
  flex-direction: row;
  align-items: center;
`;

export const InputContainer = styled.View`
  position: relative;
  flex: 1;
  height: ${ns(INPUT_HEIGHT)}px;
`;

export const Input = styled(TextInput)`
  flex: 1;
  height: ${ns(INPUT_HEIGHT)}px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${ns(RADIUS.normal)}px;
  font-family: ${({ theme }) => theme.font.regular};
  color: ${({ theme }) => theme.colors.foregroundPrimary};
  font-size: ${ns(16)}px;
  padding-right: ${ns(16)}px;
  padding-left: ${ns(44)}px;
`;

export const IconContainer = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${ns(16)}px;
  justify-content: center;
`;
