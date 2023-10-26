import React, { FC, memo } from 'react';
import { IConnectedApp, useConnectedAppsList } from '$store';
import { AppsList } from '../AppsList/AppsList';
import { Alert, useWindowDimensions } from 'react-native';
import { TonConnect } from '$tonconnect';
import { t } from '@tonkeeper/shared/i18n';
import { ScreenHeaderHeight } from '@tonkeeper/uikit/src/containers/Screen/utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacer, Steezy, Text, View, ns } from '@tonkeeper/uikit';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

interface Props {
  connectedApps: IConnectedApp[];
}

const ConnectedAppsComponent: FC<Props> = (props) => {
  const { connectedApps } = props;

  const { height: windowHeight } = useWindowDimensions();
  const safeArea = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const height =
    windowHeight - ScreenHeaderHeight - safeArea.top - tabBarHeight - ns(48) - ns(16) * 2;

  if (connectedApps.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text type="h2" textAlign="center">
          {t('browser.connected_empty_title')}
        </Text>
        <Spacer y={4} />
        <Text color="textSecondary" textAlign="center">
          {t('browser.connected_empty_text')}
        </Text>
      </View>
    );
  }

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
};

const styles = Steezy.create(() => ({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
}));

export const ConnectedApps = memo(ConnectedAppsComponent);
