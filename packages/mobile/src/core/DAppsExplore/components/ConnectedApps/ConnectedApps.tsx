import React, { FC, memo } from 'react';
import { useTranslator } from '$hooks';
import { useConnectedAppsList } from '$store';
import { AppsList } from '../AppsList/AppsList';
import { Alert } from 'react-native';
import { TonConnect } from '$tonconnect';

const ConnectedAppsComponent: FC = () => {
  const t = useTranslator();

  const connectedApps = useConnectedAppsList();

  if (connectedApps.length > 0) {
    return (
      <AppsList
        data={connectedApps}
        onItemLongPress={(url, name) =>
          Alert.alert(t('browser.remove_alert.title', { name }), '', [
            {
              text: t('cancel'),
              style: 'cancel',
            },
            {
              text: t('browser.remove_alert.approve_button'),
              style: 'destructive',
              onPress: () => TonConnect.disconnect(url),
            },
          ])
        }
      />
    );
  }

  return null;
};

export const ConnectedApps = memo(ConnectedAppsComponent);
