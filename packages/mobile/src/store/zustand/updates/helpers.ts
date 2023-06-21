import RNFS from 'react-native-fs';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';

export function getUpdatePath() {
  return (
    RNFS.DocumentDirectoryPath + `keeper_${useUpdatesStore.getState().meta?.version}.apk`
  );
}
