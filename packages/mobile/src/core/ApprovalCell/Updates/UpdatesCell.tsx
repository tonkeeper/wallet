import { Icon, List } from '$uikit';
import React from 'react';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { UpdateState } from '$store/zustand/updates/types';
import { t } from '@tonkeeper/shared/i18n';
import { installApk } from 'react-native-apk-install';
import { getUpdatePath } from '$store/zustand/updates/helpers';
import { Steezy } from '$styles';
import DeviceInfo from 'react-native-device-info';

const appVersion = DeviceInfo.getVersion();

const UpdatesCellComponent: React.FC = () => {
  const version = useUpdatesStore((state) => state.meta?.version);
  const state = useUpdatesStore((state) => state.update.state);
  const progress = useUpdatesStore((state) => state.update.progress);
  const startUpdate = useUpdatesStore((state) => state.actions.startUpdate);

  const handleInstall = React.useCallback(async () => {
    installApk(getUpdatePath());
  }, []);

  const handleRetry = React.useCallback(() => {
    startUpdate();
  }, [startUpdate]);

  const description = React.useMemo(() => {
    switch (state) {
      case UpdateState.DOWNLOADING:
        return t('update.downloading', { progress });
      case UpdateState.DOWNLOADED:
        return t('update.tap');
      case UpdateState.ERRORED:
        return t('update.retry');
      default:
        return '';
    }
  }, [state, progress]);

  const icon = React.useMemo(() => {
    switch (state) {
      case UpdateState.DOWNLOADING:
        return 'ic-download-28';
      case UpdateState.DOWNLOADED:
        return 'ic-update-28';
      case UpdateState.ERRORED:
        return 'ic-exclamationmark-triangle-28';
      default:
        return 'ic-update-28';
    }
  }, [state]);

  if (appVersion === version) {
    return null;
  }

  return (
    <List indent={false} style={styles.list}>
      <List.Item
        containerStyle={styles.container}
        disabled={[UpdateState.DOWNLOADING, UpdateState.NOT_STARTED].includes(state)}
        title={`Tonkeeper ${version}`}
        subtitle={description}
        onPress={state === UpdateState.DOWNLOADED ? handleInstall : handleRetry}
        value={
          <Icon
            color={state === UpdateState.DOWNLOADING ? 'iconSecondary' : 'iconPrimary'}
            name={icon}
            size={28}
          />
        }
      />
    </List>
  );
};

const styles = Steezy.create(({ colors }) => ({
  list: {
    backgroundColor: colors.backgroundContentTint,
  },
  container: {
    paddingVertical: 12,
  },
}));

export const UpdatesCell = React.memo(UpdatesCellComponent);
