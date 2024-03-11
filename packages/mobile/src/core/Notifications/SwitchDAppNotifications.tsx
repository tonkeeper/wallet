import { SwitchItem } from '$uikit';
import FastImage from 'react-native-fast-image';
import React, { memo, useEffect } from 'react';
import { IConnectedApp, useConnectedAppsStore } from '$store';
import { Steezy } from '$styles';
import { getChainName } from '$shared/dynamicConfig';
import { useObtainProofToken } from '$hooks/useObtainProofToken';
import { useIsFocused } from '@react-navigation/native';
import { useWallet } from '@tonkeeper/shared/hooks';

const SwitchDAppNotificationsComponent: React.FC<{ app: IConnectedApp }> = ({ app }) => {
  const wallet = useWallet();
  const [switchValue, setSwitchValue] = React.useState(!!app.notificationsEnabled);
  const [isFrozen, setIsFrozen] = React.useState(false);
  const isFocused = useIsFocused();

  // update switch value from outside
  useEffect(() => {
    if (!isFocused) {
      setSwitchValue(!!app.notificationsEnabled);
    }
  }, [isFocused, app.notificationsEnabled]);

  const { enableNotifications, disableNotifications } = useConnectedAppsStore(
    (state) => state.actions,
  );
  const obtainProofToken = useObtainProofToken();

  const handleSwitchNotifications = React.useCallback(
    async (value: boolean, url: string, session_id: string | undefined) => {
      try {
        setSwitchValue(value);
        setIsFrozen(true);
        if (!(await obtainProofToken())) {
          setIsFrozen(false);
          return setSwitchValue(!value);
        }
        if (value) {
          await enableNotifications(
            getChainName(),
            wallet.address.ton.friendly,
            url,
            session_id,
          );
        } else {
          await disableNotifications(getChainName(), wallet.address.ton.friendly, url);
        }
        setIsFrozen(false);
      } catch (error) {
        setIsFrozen(false);
        setSwitchValue(!value);
      }
    },
    [obtainProofToken, enableNotifications, wallet, disableNotifications],
  );

  return (
    <SwitchItem
      disabled={isFrozen}
      icon={<FastImage source={{ uri: app.icon }} style={styles.imageStyle.static} />}
      title={app.name}
      value={switchValue}
      onChange={() =>
        handleSwitchNotifications(
          !app.notificationsEnabled,
          app.url,
          // @ts-ignore
          app.connections[0]?.clientSessionId,
        )
      }
    />
  );
};

export const SwitchDAppNotifications = memo(
  SwitchDAppNotificationsComponent,
  (prev, next) =>
    prev.app.url === next.app.url &&
    prev.app.notificationsEnabled === next.app.notificationsEnabled,
);

const styles = Steezy.create({
  title: {
    paddingVertical: 14,
  },
  imageStyle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 16,
  },
  notificationsSection: {
    marginBottom: 16,
  },
});
