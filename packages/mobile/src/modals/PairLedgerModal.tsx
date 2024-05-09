import { Button, Modal, Spacer, Steezy, View } from '@tonkeeper/uikit';
import { FC, useCallback, useState } from 'react';
import { LedgerConnectionSteps } from '$components';
import { t } from '@tonkeeper/shared/i18n';
import { LedgerConnectionCurrentStep } from 'components/LedgerConnectionSteps/types';
import { useNavigation } from '@tonkeeper/router';
import { tk } from '$wallet';
import {
  MainStackRouteNames,
  openSetupNotifications,
  openSetupWalletDone,
} from '$navigation';
import { ImportWalletStackRouteNames } from '$navigation/ImportWalletStack/types';
import { ImportWalletInfo } from '$wallet/WalletTypes';
import {
  useBluetoothAvailable,
  usePairLedger,
  useConnectLedger,
  useLedgerAccounts,
} from '../ledger';
import { InteractionManager } from 'react-native';

interface Props {}

export const PairLedgerModal: FC<Props> = () => {
  const nav = useNavigation();

  const isAvailable = useBluetoothAvailable();
  const deviceId = usePairLedger(isAvailable);

  const { transport, tonTransport } = useConnectLedger(deviceId);
  const getLedgerAccounts = useLedgerAccounts(tonTransport, deviceId);

  const deviceModel = transport?.deviceModel?.productName || 'Ledger';

  const [loading, setLoading] = useState(false);

  let currentStep: LedgerConnectionCurrentStep = 'connect';

  if (transport) {
    currentStep = 'open-ton';
  }

  if (tonTransport) {
    currentStep = 'all-completed';
  }

  const handleContinue = useCallback(async () => {
    if (!tonTransport || !deviceId) {
      return;
    }

    try {
      setLoading(true);
      const accounts = await getLedgerAccounts();

      const walletsInfo = await tk.getLedgerWalletsInfo(accounts, deviceId);

      nav.goBack();
      InteractionManager.runAfterInteractions(() => {
        nav.navigate(MainStackRouteNames.ImportWalletStack, {
          screen: ImportWalletStackRouteNames.ChooseLedgerWallets,
          params: {
            walletsInfo,
            onDone: async (selectedWallets: ImportWalletInfo[]) => {
              const identifiers = await tk.addLedgerWallets(
                selectedWallets,
                deviceId,
                deviceModel,
              );

              const isNotificationsDenied = await tk.wallet.notifications.getIsDenied();

              if (isNotificationsDenied) {
                openSetupWalletDone(identifiers);
              } else {
                openSetupNotifications(identifiers);
              }
            },
          },
        });
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, [deviceId, deviceModel, getLedgerAccounts, nav, tonTransport]);

  return (
    <Modal>
      <Modal.Header title={t('ledger.connect_title')} />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <LedgerConnectionSteps currentStep={currentStep} />
        </View>
        <View style={styles.buttonsContainer}>
          <View style={styles.button}>
            <Button onPress={nav.closeModal} color="secondary" title={t('cancel')} />
          </View>
          <Spacer x={16} />
          <View style={styles.button}>
            <Button onPress={handleContinue} loading={loading} title={t('continue')} />
          </View>
        </View>
      </Modal.Content>
    </Modal>
  );
};

const styles = Steezy.create(() => ({
  container: {
    marginHorizontal: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  button: {
    flex: 1,
  },
}));
