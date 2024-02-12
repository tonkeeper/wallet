import React, { useCallback } from 'react';
import { Button, Icon, Screen, Spacer, Text } from '$uikit';
import * as S from '$core/SetupNotifications/SetupNotifications.style';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

interface Props {
  route: RouteProp<ImportWalletStackParamList, ImportWalletStackRouteNames.Notifications>;
}

export const SetupNotifications: React.FC<Props> = (props) => {
  const { identifiers } = props.route.params;

  const [loading, setLoading] = React.useState(false);
  const safeArea = useSafeAreaInsets();

  const handleDone = useCallback(() => {
    openSetupWalletDone(identifiers);
  }, [identifiers]);

  const handleEnableNotifications = React.useCallback(async () => {
    try {
      setLoading(true);

      if (identifiers.length > 1) {
        await tk.enableNotificationsForAll(identifiers);
      } else {
        await tk.wallet.notifications.subscribe();
      }

      handleDone();
    } catch (err) {
      setLoading(false);
      Toast.fail(err?.massage);
      debugLog('[SetupNotifications]:', err);
    }
  }, [handleDone, identifiers]);

  return (
    <Screen>
      <Screen.Header
        rightContent={
          <Button
            size="navbar_small"
            mode="secondary"
            style={{ marginRight: ns(16) }}
            onPress={handleDone}
          >
            {t('later')}
          </Button>
        }
      />
      <S.Wrap>
        <S.Content>
          <S.IconWrap>
            <Icon name="ic-notification-128" color="accentPrimary" />
          </S.IconWrap>
          <Text textAlign="center" variant="h2">
            {t('setup_notifications_title')}
          </Text>
          <Spacer y={4} />
          <Text textAlign="center" variant="body1" color="foregroundSecondary">
            {t('setup_notifications_caption')}
          </Text>
        </S.Content>
        <S.Footer style={{ paddingBottom: safeArea.bottom }}>
          <Button isLoading={loading} onPress={handleEnableNotifications}>
            {t('setup_notifications_enable_button')}
          </Button>
        </S.Footer>
      </S.Wrap>
    </Screen>
  );
};
