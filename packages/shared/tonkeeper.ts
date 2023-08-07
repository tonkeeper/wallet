import { MobilePasscodeController } from './screens/MobilePasscodeScreen';
import { MobileVault } from './utils/MobileVault';
import { Tonkeeper } from '@tonkeeper/core';
import { queryClient } from './queryClient';
import { tonapi } from './tonapi';

import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
  setItem: AsyncStorage.setItem,
  getItem: AsyncStorage.getItem,
  set: AsyncStorage.setItem
};

export const tonkeeper = new Tonkeeper({
  vault: new MobileVault(MobilePasscodeController),
  queryClient,
  tonapi,
  // sse: {},
  storage
});
