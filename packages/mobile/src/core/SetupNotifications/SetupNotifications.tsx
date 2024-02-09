import React from 'react';
import { Button, Icon, Screen, Spacer, Text } from '$uikit';
import * as S from '$core/SetupNotifications/SetupNotifications.style';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '@tonkeeper/shared/i18n';
import { openSetupWalletDone } from '$navigation';
import { ns } from '$utils';
import { debugLog } from '$utils/debugLog';
import { useNotifications } from '$hooks/useNotifications';
import { saveDontShowReminderNotifications } from '$utils/messaging';
import { Toast } from '$store';
import { useWallets } from '@tonkeeper/shared/hooks';
import { walletGeneratedVaultSelector } from '$store/wallet';
import { useSelector } from 'react-redux';

export const SetupNotifications: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const notifications = useNotifications();
  const safeArea = useSafeAreaInsets();
  const wallets = useWallets();

  const generatedVault = useSelector(walletGeneratedVaultSelector);

  React.useEffect(() => {
    saveDontShowReminderNotifications();
  }, []);

  const versions = generatedVault?.versions ?? [];

  const withoutCustomize = wallets.length === versions.length;

  const handleEnableNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      await notifications.subscribe();
      openSetupWalletDone(withoutCustomize);
    } catch (err) {
      setLoading(false);
      Toast.fail(err?.massage);
      debugLog('[SetupNotifications]:', err);
    }
  }, [notifications, withoutCustomize]);

  return (
    <Screen>
      <Screen.Header
        rightContent={
          <Button
            size="navbar_small"
            mode="secondary"
            style={{ marginRight: ns(16) }}
            onPress={() => openSetupWalletDone(withoutCustomize)}
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
