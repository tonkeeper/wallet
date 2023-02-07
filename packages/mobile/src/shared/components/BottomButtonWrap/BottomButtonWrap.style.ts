import LinearGradient from 'react-native-linear-gradient';

import styled from '$styled';
import { ns } from '$utils';

export const Wrap = styled.View`
  padding-horizontal: ${ns(16)}px;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  padding-top: ${ns(16)}px;
`;

export const Helper = styled.View`
  flex: 0 0 auto;
  width: 100%;
`;

export const Gradient = styled(LinearGradient)`
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

export const Content = styled.View`
  z-index: 2;
`;
