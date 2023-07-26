import { Steezy, Modal, View } from '@tonkeeper/uikit';
import { memo } from 'react';

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

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <View style={{ height: 200 }}>

        </View>
        
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create({
  container: {},
});
