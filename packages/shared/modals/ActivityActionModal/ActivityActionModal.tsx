import { SheetActions, navigation } from '@tonkeeper/router';
import { renderActionModalContent } from './renderActionModalContent';
import { Modal, Toast } from '@tonkeeper/uikit';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { memo } from 'react';
import {
  ActionItem,
  ActionSource,
  AnyActionItem,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';

type ActivityActionModalProps = {
  action: AnyActionItem;
};

/** Payload with possibly big content to render.
 * We should wrap content into ScrollView
 * if action has any of these fields.
 * TODO: should measure content size and conditionally wrap into ScrollView
 * */
const possiblyLargePayloadFields = ['payload', 'comment', 'encrypted_comment'];

export const ActivityActionModal = memo<ActivityActionModalProps>((props) => {
  const { action } = props;

  const shouldWrapIntoScrollView =
    possiblyLargePayloadFields.findIndex((field) => (action as any)?.payload?.[field]) !==
    -1;

  const Content = shouldWrapIntoScrollView ? Modal.ScrollView : Modal.Content;

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
