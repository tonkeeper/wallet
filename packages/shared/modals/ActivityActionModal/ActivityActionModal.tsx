import { ActionItem, ActionSource, AnyActionItem } from '@tonkeeper/core';
import { SheetActions, navigation } from '@tonkeeper/router';
import { renderActionModalContent } from './renderActionModalContent';
import { Modal, Toast } from '@tonkeeper/uikit';
import { tk } from '../../tonkeeper';
import { memo } from 'react';

type ActivityActionModalProps = {
  action: AnyActionItem;
};

export const ActivityActionModal = memo<ActivityActionModalProps>((props) => {
  const { action } = props;

  // TODO: need auto detect modal content size
  const Content =
    (action as any)?.payload?.comment || (action as any)?.payload?.comment ? Modal.ScrollView : Modal.Content;

  return (
    <Modal>
      <Modal.Header />
      <Content safeArea>{renderActionModalContent(action)}</Content>
    </Modal>
  );
});

export async function openActivityActionModal(actionId: string, source: ActionSource) {
  const openModal = (action: ActionItem) => {
    navigation.push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: ActivityActionModal,
      params: { action },
      path: 'TRANSACTION_DETAILS',
    });
  };

  try {
    if (source === ActionSource.Tron) {
      const item = tk.wallet.activityLoader.getTronAction(actionId);
      if (item) {
        openModal(item);
      } else {
        Toast.loading();
        const item = await tk.wallet.activityLoader.loadTronAction(actionId);
        if (item) {
          openModal(item);
        }
        Toast.hide();
      }
    } else {
      const item = tk.wallet.activityLoader.getTonAction(actionId);
      if (item) {
        openModal(item);
      } else {
        Toast.loading();
        const item = await tk.wallet.activityLoader.loadTonAction(actionId);
        if (item) {
          openModal(item);
        }
        Toast.hide();
      }
    }
  } catch (err) {
    console.log(err);
    Toast.fail('Error load event');
  }
}
