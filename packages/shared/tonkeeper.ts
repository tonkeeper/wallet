import { MobilePasscodeController } from './screens/MobilePasscodeScreen';
import { MobileVault } from './utils/MobileVault';
import { SSEManager, ServerSentEventsOptions, Tonkeeper } from '@tonkeeper/core';
import { queryClient } from './queryClient';
import { tonapi } from './tonapi';

import AsyncStorage from '@react-native-async-storage/async-storage';
import EventSource from 'react-native-sse';
import { config } from './config';

const storage = {
  setItem: AsyncStorage.setItem,
  getItem: AsyncStorage.getItem,
  set: AsyncStorage.setItem,
};

export class SSEManagerImpl implements SSEManager {
  private baseUrl: () => string;
  private token: () => string;

  constructor(options: ServerSentEventsOptions) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
  }

  public listen(url: string) {
    const baseUrl = this.baseUrl();
    const token = this.token();
  
    return new EventSource(baseUrl + '/' + url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const sse = new SSEManagerImpl({
  baseUrl: () => config.get('tonapiV2Endpoint'),
  token: () => config.get('tonApiKey'),
});

export const tk = new Tonkeeper({
  vault: new MobileVault(MobilePasscodeController),
  queryClient,
  tonapi,
  storage,
  sse,
});
