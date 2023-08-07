import { MobilePasscodeController } from './screens/MobilePasscodeScreen';
import { MobileVault } from './utils/MobileVault';
import { Tonkeeper } from '@tonkeeper/core';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const tonkeeper = new Tonkeeper({
  vault: new MobileVault(MobilePasscodeController),
  // passcode
  storage: {
    setItem: AsyncStorage.setItem,
    getItem: AsyncStorage.getItem,
    set: AsyncStorage.setItem
  },
});
