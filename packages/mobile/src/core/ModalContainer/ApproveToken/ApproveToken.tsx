import { Modal } from '$libs/navigation';
import { SheetActions } from '$libs/navigation/components/Modal/Sheet/SheetsProvider';
import { push } from '$navigation';
import React, { memo } from 'react';

export const ApproveToken = memo(() => {
  return (
    <Modal>
      <Modal.Header />
      <Modal.Content />
      <Modal.Footer />
    </Modal>
  );
});

export const openApproveTokenModal = async () => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: ApproveToken,
    path: 'ApproveToken',
  });

  return true;
};
