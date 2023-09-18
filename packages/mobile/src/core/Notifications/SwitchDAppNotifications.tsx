import { SwitchItem } from '$uikit';
import FastImage from 'react-native-fast-image';
import React, { memo, useEffect } from 'react';
import { IConnectedApp, useConnectedAppsStore } from '$store';
import { Steezy } from '$styles';
import { getChainName } from '$shared/dynamicConfig';
import { useObtainProofToken } from '$hooks/useObtainProofToken';
import { useSelector } from 'react-redux';
import { walletAddressSelector } from '$store/wallet';

const SwitchDAppNotificationsComponent: React.FC<{ app: IConnectedApp }> = ({ app }) => {
  const address = useSelector(walletAddressSelector);
  const [switchValue, setSwitchValue] = React.useState(!!app.notificationsEnabled);
  const [isFrozen, setIsFrozen] = React.useState(false);

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
          await enableNotifications(getChainName(), address.ton, url, session_id);
        } else {
          await disableNotifications(getChainName(), address.ton, url);
        }
        setIsFrozen(false);
      } catch (error) {
        setIsFrozen(false);
        setSwitchValue(!value);
      }
    },
    [
      setIsFrozen,
      obtainProofToken,
      disableNotifications,
      address.ton,
      enableNotifications,
    ],
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

export const SwitchDAppNotifications = memo(SwitchDAppNotificationsComponent);

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
