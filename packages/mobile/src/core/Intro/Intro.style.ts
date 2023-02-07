import { SafeAreaView } from 'react-native-safe-area-context';

import styled from '$styled';
import { nfs, ns } from '$utils';

export const Wrap = styled(SafeAreaView)`
  flex: 1;
`;

export const Content = styled.ScrollView.attrs({
  contentContainerStyle: {
    padding: ns(32),
  },
})`
  flex: 1;
`;

export const Items = styled.View``;

export const Item = styled.View`
  margin-top: ${ns(32)}px;
  flex-direction: row;
`;

export const ItemCont = styled.View`
  margin-left: ${ns(16)}px;
  flex: 1;
`;
