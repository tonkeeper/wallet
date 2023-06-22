import RNFS from 'react-native-fs';

export function getUpdatePath() {
  return RNFS.DocumentDirectoryPath + `/keeper.apk`;
}
