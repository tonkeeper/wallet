import { useNotificationsStore } from '$store/zustand/notifications/useNotificationsStore';
import crashlytics from '@react-native-firebase/crashlytics';
import { DevFeature, NotificationType, useDevFeaturesToggle } from '$store';
import { List, Screen, copyText } from '@tonkeeper/uikit';
import { Switch } from 'react-native-gesture-handler';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@tonkeeper/router';
import { config } from '$config';
import RNRestart from 'react-native-restart';
import { FC, useCallback, useState } from 'react';
import { openLogs } from '$navigation';
import Clipboard from '@react-native-community/clipboard';
import { tk } from '$wallet';
import messaging from '@react-native-firebase/messaging';

export const DevMenu: FC = () => {
  const nav = useNavigation();
  const addNotification = useNotificationsStore((state) => state.actions.addNotification);

  const [_, rerender] = useState(0);

  const handleSave = useCallback(() => rerender((c) => c + 1), []);

  const handleLogs = useCallback(() => {
    openLogs();
  }, []);

  const handleTestCrash = useCallback(() => {
    crashlytics().crash();
  }, []);

  const handleClearNFTsCache = useCallback(() => {
    tk.wallet.nfts.reset();
  }, []);

  const handleClearJettonsCache = useCallback(() => {
    if (tk.wallet) {
      tk.wallet.jettons.reset();
    }
  }, []);

  const handleTestJsCrash = useCallback(() => {
    throw new Error('Test js crash');
  }, []);

  const handleComponents = useCallback(() => {
    nav.navigate('DevStack');
  }, [nav]);

  const handlePushNotification = useCallback(() => {
    addNotification(
      {
        type: NotificationType.CONSOLE_DAPP_NOTIFICATION,
        message: 'Test notification added',
        dapp_url: 'https://getgems.io',
        received_at: Date.now(),
        link: 'https://getgems.io',
      },
      tk.wallet.address.ton.raw,
    );
  }, [addNotification]);

  const handleShowRestakeBanner = useCallback(
    (address: string, name: string) => () => {
      addNotification(
        {
          type: NotificationType.BETTER_STAKE_OPTION_FOUND,
          name: 'Tonkeeper',
          icon_url: 'https://tonkeeper.com/assets/apps/tonkeeper.png',
          message: `Withdraw from ${name} please 🥺`,
          received_at: Date.now(),
          deeplink: 'ton://staking',
        },
        tk.wallet.address.ton.raw,
      );
      tk.wallet.staking.toggleRestakeBanner(true, address);
    },
    [addNotification],
  );

  const {
    devFeatures,
    actions: { toggleFeature },
  } = useDevFeaturesToggle();

  const handleCopyFCMToken = useCallback(async () => {
    try {
      const token = await messaging().getToken();
      Clipboard.setString(String(token));
    } catch {}
  }, []);

  const toggleHttpProtocol = useCallback(() => {
    toggleFeature(DevFeature.UseHttpProtocol);
  }, [toggleFeature]);

  const toggleDevMode = useCallback(() => {
    config.set({ devmode_enabled: !config.get('devmode_enabled') });
    handleSave();
  }, [handleSave]);

  const handleClearActivityCache = useCallback(() => {
    if (tk.wallet) {
      tk.wallet.activityList.state.clear();
      tk.wallet.activityList.state.clearPersist();
      tk.wallet.jettonActivityList.state.clear();
      tk.wallet.jettonActivityList.state.clearPersist();
      tk.wallet.tonActivityList.state.clear();
      tk.wallet.tonActivityList.state.clearPersist();
    }
  }, []);

  return (
    <Screen>
      <Screen.Header title="Dev Menu" />
      <Screen.ScrollView>
        <List>
          <List.Item
            title="Dev mode"
            rightContent={
              <Switch value={config.get('devmode_enabled')} onChange={toggleDevMode} />
            }
          />
          <List.Item
            title={`Version ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`}
            onPress={copyText(
              `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,
            )}
          />
          <List.Item onPress={handleLogs} title="Logs" />
          <List.Item title="App config" onPress={() => nav.navigate('/dev/config')} />
          {__DEV__ && (
            <List.Item
              title="Dev Tonapi"
              rightContent={
                <Switch
                  value={config.get('tonapiIOEndpoint') === 'https://dev.tonapi.io'}
                  onChange={() => {
                    const devHost = 'https://dev.tonapi.io';
                    if (config.get('tonapiIOEndpoint') !== devHost) {
                      config.set({ tonapiIOEndpoint: devHost });
                    } else {
                      config.set({ tonapiIOEndpoint: undefined });
                    }

                    RNRestart.restart();
                  }}
                />
              }
            />
          )}
          <List.Item
            title="Use HTTP protocol in browser"
            rightContent={
              <Switch
                value={devFeatures[DevFeature.UseHttpProtocol]}
                onChange={toggleHttpProtocol}
              />
            }
          />
          {__DEV__ && (
            <>
              <List.Item onPress={handleTestCrash} title="Test native crash" />
              <List.Item onPress={handleTestJsCrash} title="Test js-crash" />
              <List.Item onPress={handleComponents} title="Components" />
            </>
          )}
        </List>
        {/* <CellSection>
            <PopupSelect
              items={['auto', ...tags.map((lang) => lang.tag)]}
              selected={devLanguage || 'auto'}
              onChange={(lang) => setDevLanguage(lang === 'auto' ? undefined : lang)}
              keyExtractor={(item) => item}
              width={220}
              renderItem={(item) => <Text variant="label1">{item}</Text>}
            >
              <CellSectionItem
                indicator={
                  <Text variant="label1" color="accentPrimary">
                    {devLanguage || 'auto'}
                  </Text>
                }
              >
                Language
              </CellSectionItem>
            </PopupSelect>
          </CellSection> */}
        <List>
          <List.Item
            onPress={handleClearActivityCache}
            title="Clear transactions cache"
          />
          <List.Item onPress={handleClearJettonsCache} title="Clear jettons cache" />
          <List.Item onPress={handleClearNFTsCache} title="Clear NFTs cache" />
        </List>
        <List>
          <List.Item onPress={handleCopyFCMToken} title="Copy FCM token" />
          <List.Item onPress={handlePushNotification} title="Push notification" />
        </List>
      </Screen.ScrollView>
    </Screen>
  );
};
