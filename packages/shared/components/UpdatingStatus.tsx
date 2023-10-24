import { View, Text, Steezy, Loader, Spacer } from '@tonkeeper/uikit';
import { NetworkStatus } from '@tonkeeper/core/src/managers/NetworkState';
import { useNetworkState } from '../hooks/useNetworkState';
import { intervalToDuration } from 'date-fns';
import { memo, useMemo } from 'react';
import { t } from '../i18n';

export const UpdatingStatus = memo(() => {
  const network = useNetworkState();

  const status = useMemo(() => {
    const intervalSynced = intervalToDuration({
      start: new Date(network.lastSyncedTimestamp ?? 0),
      end: new Date(),
    });

    const syncedMoreFiveMin = intervalSynced.minutes;

    if (network.status === NetworkStatus.Updating) {
      return (
        <View style={styles.updatingStatus}>
          <Text type="body2" color="textSecondary">
            {t('status.updating')}
          </Text>
          <Spacer x={4} />
          <Loader size="xsmall" />
        </View>
      );
    } else if (syncedMoreFiveMin && network.status === NetworkStatus.Offline) {
      return (
        <Text type="body2" color="accentOrange">
          {t('status.last_synced', { count: intervalSynced.minutes })}
        </Text>
      );
    } else if (network.status === NetworkStatus.Offline) {
      return (
        <Text type="body2" color="textSecondary">
          {t('status.no_internet_connection')}
        </Text>
      );
    }

    return null;
  }, [network.status, network.lastSyncedTimestamp]);

  if (status) {
    return (
      <View style={styles.container}>
        <View style={styles.absolute}>{status}</View>
      </View>
    );
  }

  return null;
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    position: 'relative',
  },
  absolute: {
    backgroundColor: colors.backgroundPage,
    position: 'absolute',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 5,
  },
  updatingStatus: {
    flexDirection: 'row',
  },
}));
