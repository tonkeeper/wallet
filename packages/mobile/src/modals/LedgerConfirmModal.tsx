import { Button, Modal, Steezy, Toast, View } from '@tonkeeper/uikit';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LedgerConnectionSteps } from '$components';
import { t } from '@tonkeeper/shared/i18n';
import { LedgerConnectionCurrentStep } from 'components/LedgerConnectionSteps/types';
import { useNavigation } from '@tonkeeper/router';
import { useBluetoothAvailable, useConnectLedger } from '../ledger';
import {
  LedgerTransaction,
  setLedgerConfirmModalRef,
} from '$wallet/managers/SignerManager';
import { Address, Cell } from '@ton/core';
import { tk } from '$wallet';
import { getLedgerAccountPathByIndex } from '$utils/ledger';

interface Props {
  walletIdentifier: string;
  transaction: LedgerTransaction;
  onDone: (body: Cell) => void;
  onClose: () => void;
}

export const LedgerConfirmModal: FC<Props> = (props) => {
  const { walletIdentifier, transaction, onDone, onClose } = props;

  const wallet = useMemo(() => tk.wallets.get(walletIdentifier)!, [walletIdentifier]);

  const deviceId = wallet.config.ledger!.deviceId;
  const accountIndex = wallet.config.ledger!.accountIndex;

  const [isSigned, setIsSigned] = useState(false);
  const isSignedRef = useRef(isSigned);
  isSignedRef.current = isSigned;

  const nav = useNavigation();

  useBluetoothAvailable();

  const { transport, tonTransport } = useConnectLedger(deviceId);

  const signTx = useCallback(async () => {
    if (!tonTransport || isSignedRef.current) {
      return;
    }

    try {
      const body = await tonTransport.signTransaction(
        getLedgerAccountPathByIndex(accountIndex),
        transaction,
      );
      setIsSigned(true);
      setTimeout(() => {
        nav.closeModal?.();
        onDone(body);
      }, 1500);
    } catch (e) {
      console.log('signTx error', e.message);

      nav.closeModal?.();

      if (!e.message.includes('0x6985')) {
        Toast.fail(e.message);
      }
    }
  }, [accountIndex, nav, onDone, tonTransport, transaction]);

  useEffect(() => {
    signTx();
  }, [signTx]);

  useEffect(
    () => () => {
      if (!isSignedRef.current) {
        onClose();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  let currentStep: LedgerConnectionCurrentStep = 'connect';

  if (transport) {
    currentStep = 'open-ton';
  }

  if (tonTransport) {
    currentStep = 'confirm-tx';
  }

  if (isSigned) {
    currentStep = 'all-completed';
  }

  return (
    <Modal>
      <Modal.Header title={t('ledger.confirm_title')} />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <LedgerConnectionSteps currentStep={currentStep} showConfirmTxStep />
        </View>
        <View style={styles.buttonsContainer}>
          <Button onPress={nav.closeModal} color="secondary" title={t('cancel')} />
        </View>
      </Modal.Content>
    </Modal>
  );
};

setLedgerConfirmModalRef(LedgerConfirmModal);

const styles = Steezy.create(() => ({
  container: {
    marginHorizontal: 16,
  },
  buttonsContainer: {
    padding: 16,
  },
}));
