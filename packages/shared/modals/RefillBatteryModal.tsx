import { memo } from 'react';
import { Modal, Steezy } from '@tonkeeper/uikit';
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

export const styles = Steezy.create({
  contentContainer: {
    paddingTop: 48,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  indent: {
    paddingHorizontal: 16,
  },
});
