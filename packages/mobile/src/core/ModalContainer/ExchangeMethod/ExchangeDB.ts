import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog } from '$utils/debugLog';

export const ExchangeDB = {
  isShowDetails: async (methodId: string) => {
    try {
      const isDontShowAgain = await AsyncStorage.getItem(
        `dontShowExchangeDetails-${methodId}`,
      );

      return !Boolean(isDontShowAgain);
    } catch (err) {
      debugLog(err);
      return true;
    }
  },
  dontShowDetails: async (methodId: string) => {
    await AsyncStorage.setItem(`dontShowExchangeDetails-${methodId}`, 'true');
  },
};
