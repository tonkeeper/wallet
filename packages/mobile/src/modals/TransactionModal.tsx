import { Steezy, Modal, View } from '@tonkeeper/uikit';
import { useTransaction } from '@tonkeeper/core/src/query/useTransaction';
import { memo } from 'react';
import { usePrepareDetailedAction } from '$hooks';
import { ActionBase } from '$core/ModalContainer/Action/ActionBase/ActionBase';

// type TransactionModalParams = {
//   transactionId: string;
// };

// export const TransactionModalController = createRouteController<TransactionModalParams>(
//   async (router, params) => {
//     try {
//       const cachedEvent = accountEvents.getCachedEventById(params.eventId);
//       if (cachedEvent) {
//         return router.pass(cachedEvent);
//       } else {
//         Toast.loading();
//         const event = await accountEvents.fetchEventById(params.eventId);
//         Toast.hide();

//         return router.pass(event);
//       }
//     } catch (err) {
//       Toast.fail('Message');
//     }
//   },
// );

interface TransactionModalProps {
  transactionId: string;
}

export const TransactionModal = memo<TransactionModalProps>((props) => {
  const { transactionId } = props;
  const transaction = useTransaction(transactionId);
  const actionProps = usePrepareDetailedAction(transaction.action, transaction.event);

  return <ActionBase {...actionProps} />;
});

const styles = Steezy.create({
  container: {
    padding: 16,
  },
});
