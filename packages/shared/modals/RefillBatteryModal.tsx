import { memo } from 'react';
import { Modal } from '@tonkeeper/uikit';
import { navigation, SheetActions } from '@tonkeeper/router';
import { RefillBattery } from '../components/RefillBattery/RefillBattery';

export const RefillBatteryModal = memo(() => {
  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <RefillBattery />
      </Modal.Content>
      <Modal.Footer />
    </Modal>
  );
});

export function openRefillBatteryModal() {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: RefillBatteryModal,
    path: '/refill-battery',
  });
}
