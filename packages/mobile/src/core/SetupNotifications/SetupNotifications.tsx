import React, { useCallback } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { openSetupWalletDone } from '$navigation';
import { ns } from '$utils';
import { debugLog } from '$utils/debugLog';
import { Toast } from '$store';
import { tk } from '$wallet';
import { RouteProp } from '@react-navigation/native';
import {
  ImportWalletStackParamList,
  ImportWalletStackRouteNames,
} from '$navigation/ImportWalletStack/types';
import { Button, Icon, Screen, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { delay } from '@tonkeeper/core';

interface Props {
  route: RouteProp<ImportWalletStackParamList, ImportWalletStackRouteNames.Notifications>;
}

export const SetupNotifications: React.FC<Props> = (props) => {
  const { identifiers } = props.route.params;

  const [loading, setLoading] = React.useState(false);

  const handleDone = useCallback(() => {
    openSetupWalletDone(identifiers);
  }, [identifiers]);

  const handleEnableNotifications = React.useCallback(async () => {
    try {
      setLoading(true);

      if (identifiers.length > 1) {
        await Promise.race([tk.enableNotificationsForAll(identifiers), delay(10000)]);
      } else {
        await Promise.race([tk.wallet.notifications.subscribe(), delay(10000)]);
      }

      handleDone();
    } catch (err) {
      setLoading(false);
      Toast.fail(err?.massage);
      debugLog('[SetupNotifications]:', err);
    }
  }, [handleDone, identifiers]);

  return (
    <Screen alternateBackground>
      <Screen.Header
        hideBackButton
        rightContent={
          <Button
            size="header"
            color="secondary"
            title={t('later')}
            style={{ marginRight: ns(16) }}
            onPress={handleDone}
          />
        }
        alternateBackground
      />
      <Screen.Content>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Icon name="ic-notification-128" color="accentBlue" />
          </View>
          <Spacer y={16} />
          <Text textAlign="center" type="h2">
            {t('setup_notifications_title')}
          </Text>
          <Spacer y={4} />
          <Text textAlign="center" color="textSecondary">
            {t('setup_notifications_caption')}
          </Text>
        </View>
        <Screen.ButtonSpacer />
      </Screen.Content>
      <Screen.ButtonContainer>
        <Button
          loading={loading}
          onPress={handleEnableNotifications}
          title={t('setup_notifications_enable_button')}
        />
      </Screen.ButtonContainer>
    </Screen>
  );
};

const styles = Steezy.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -24,
  },
  iconContainer: {
    alignItems: 'center',
  },
});
