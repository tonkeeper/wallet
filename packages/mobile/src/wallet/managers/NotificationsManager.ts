import DeviceInfo from 'react-native-device-info';
import { config } from '$config';
import { TonRawAddress } from '../WalletTypes';
import { Address, State, Storage, network } from '@tonkeeper/core';
import { i18n } from '@tonkeeper/shared/i18n';
import { isAndroid } from '$utils';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { NamespacedLogger } from '$logger';
import { isIOS } from '@tonkeeper/uikit';

export interface NotificationsState {
  isSubscribed: boolean;
}

const hasGms = DeviceInfo.hasGmsSync();

export class NotificationsManager {
  static readonly INITIAL_STATE: NotificationsState = {
    isSubscribed: false,
  };

  public state = new State(NotificationsManager.INITIAL_STATE);

  public isAvailable = hasGms || isIOS;

  constructor(
    private persistPath: string,
    private tonRawAddress: TonRawAddress,
    private isTestnet: boolean,
    private storage: Storage,
    private logger: NamespacedLogger,
  ) {
    this.state.persist({
      partialize: ({ isSubscribed }) => ({ isSubscribed }),
      storage: this.storage,
      key: `${this.persistPath}/notifications`,
    });
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async subscribe() {
    this.logger.debug('NotificationsManager.subscribe call');

    const token = await this.requestUserPermissionAndGetToken();

    if (!token) {
      return false;
    }

    const endpoint = `${config.get(
      'tonapiIOEndpoint',
      this.isTestnet,
    )}/v1/internal/pushes/plain/subscribe`;
    const deviceId = DeviceInfo.getUniqueId();

    await network.post(endpoint, {
      params: {
        locale: i18n.locale,
        device: deviceId,
        accounts: [
          { address: Address.parse(this.tonRawAddress).toFriendly({ bounceable: true }) },
        ],
        token,
      },
    });

    this.state.set({ isSubscribed: true });

    this.logger.debug('NotificationsManager.subscribe done');

    return true;
  }

  public async unsubscribe() {
    this.logger.debug('NotificationsManager.unsubscribe call');

    if (!this.state.data.isSubscribed) {
      return false;
    }

    const deviceId = DeviceInfo.getUniqueId();
    const endpoint = `${config.get('tonapiIOEndpoint', this.isTestnet)}/unsubscribe`;

    await network.post(endpoint, {
      params: {
        device: deviceId,
        accounts: [
          { address: Address.parse(this.tonRawAddress).toFriendly({ bounceable: true }) },
        ],
      },
    });

    this.state.set({ isSubscribed: false });

    this.logger.debug('NotificationsManager.unsubscribe done');

    return true;
  }

  public async getIsDenied() {
    try {
      if (!this.isAvailable) {
        return true;
      }

      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.DENIED;
    } catch {
      return false;
    }
  }

  private async getPermission() {
    if (isAndroid && +Platform.Version >= 33) {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    } else {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    }
  }

  private async getToken() {
    return await messaging().getToken();
  }

  private async requestUserPermissionAndGetToken() {
    if (isAndroid && +Platform.Version >= 33) {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      const enabled = status === PermissionsAndroid.RESULTS.GRANTED;

      if (!enabled) {
        return false;
      }
    } else {
      const hasPermission = await this.getPermission();

      if (!hasPermission) {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          return false;
        }
      }
    }

    return await this.getToken();
  }
}
