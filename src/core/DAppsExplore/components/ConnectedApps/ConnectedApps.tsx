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
        title={t('browser.connected_title')}
        data={connectedApps}
        onItemLongPress={(url) =>
          Alert.alert(
            t('dapps.remove_alert_title'),
            t('dapps.remove_alert_caption'),
            [
              {
                text: t('cancel'),
                style: 'cancel',
              },
              {
                text: t('dapps.remove_alert_button'),
                style: 'destructive',
                onPress: () => TonConnect.disconnect(url),
              },
            ],
          )
        }
      />
    );
  }

  return null;
};

export const ConnectedApps = memo(ConnectedAppsComponent);
