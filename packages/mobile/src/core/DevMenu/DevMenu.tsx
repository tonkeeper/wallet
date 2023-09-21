import { useNotificationsStore } from '$store/zustand/notifications/useNotificationsStore';
import { alwaysShowV4R1Selector, isTestnetSelector, mainActions } from '$store/main';
import { JettonsDB, MainDB, NFTsDB } from '$database';
import crashlytics from '@react-native-firebase/crashlytics';
import { DevFeature, useDevFeaturesToggle } from '$store';
import { List, Screen, copyText } from '@tonkeeper/uikit';
import { useDispatch, useSelector } from 'react-redux';
import { Switch } from 'react-native-gesture-handler';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@tonkeeper/router';
import { config } from '@tonkeeper/shared/config';
import { jettonsActions } from '$store/jettons';
import RNRestart from 'react-native-restart';
import { t } from '@tonkeeper/shared/i18n';
import { nftsActions } from '$store/nfts';
import { FC, useCallback } from 'react';
import { openLogs } from '$navigation';
import { Alert } from 'react-native';
import { Icon } from '$uikit';
import { tk } from '@tonkeeper/shared/tonkeeper';

export const DevMenu: FC = () => {
  const nav = useNavigation();
  const dispatch = useDispatch();
  const isTestnet = useSelector(isTestnetSelector);
  const alwaysShowV4R1 = useSelector(alwaysShowV4R1Selector);
  const addNotification = useNotificationsStore((state) => state.actions.addNotification);

  const handleToggleTestnet = useCallback(() => {
    Alert.alert(t('settings_network_alert_title'), '', [
      {
        text: 'Testnet',
        onPress: () => {
          dispatch(mainActions.toggleTestnet({ isTestnet: true }));
        },
      },
      {
        text: 'Mainnet',
        onPress: () => {
          dispatch(mainActions.toggleTestnet({ isTestnet: false }));
        },
      },
    ]);
  }, [dispatch, t]);

  const handleLogs = useCallback(() => {
    openLogs();
  }, []);

  const handleTestCrash = useCallback(() => {
    crashlytics().crash();
  }, []);

  const handleShowV4R1 = useCallback(() => {
    dispatch(mainActions.setShowV4R1(!alwaysShowV4R1));
    MainDB.setShowV4R1(!alwaysShowV4R1);
  }, [alwaysShowV4R1, dispatch]);

  const handleClearNFTsCache = useCallback(() => {
    NFTsDB.clearAll();
    dispatch(nftsActions.resetNFTs());
  }, [dispatch]);

  const handleClearJettonsCache = useCallback(() => {
    JettonsDB.clearAll();
    dispatch(jettonsActions.resetJettons());
  }, [dispatch]);

  const handleTestJsCrash = useCallback(() => {
    throw new Error('Test js crash');
  }, []);

  const handleComponents = useCallback(() => {
    nav.navigate('DevStack');
  }, [nav]);

  const handlePushNotification = useCallback(() => {
    addNotification({
      message: 'Test notification added',
      dapp_url: 'https://getgems.io',
      received_at: Date.now(),
      link: 'https://getgems.io',
    });
  }, [addNotification]);

  const {
    devFeatures,
    devLanguage,
    actions: { toggleFeature, setDevLanguage },
  } = useDevFeaturesToggle();

  const toggleHttpProtocol = useCallback(() => {
    toggleFeature(DevFeature.UseHttpProtocol);
  }, [toggleFeature]);

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
            title={`Version ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`}
            onPress={copyText(
              `${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`,
            )}
          />
          <List.Item
            title={t(isTestnet ? 'settings_to_mainnet' : 'settings_to_testnet')}
            rightContent={<Icon name="ic-reset-24" color="accentPrimary" />}
            onPress={handleToggleTestnet}
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
          <List.Item
            title=" Force show v4r1"
            rightContent={
              <Switch value={alwaysShowV4R1} onValueChange={handleShowV4R1} />
            }
          />
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
          <List.Item onPress={handlePushNotification} title="Push notification" />
        </List>
      </Screen.ScrollView>
    </Screen>
  );
};
