import { MappedEvent } from '../mappers/AccountEventsMapper';
import { StyleSheet } from 'react-native';
import { memo } from 'react';

// type TransactionModalParams = {
//   eventId: string;
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
  event: MappedEvent;
}

export const TransactionModal = memo<TransactionModalProps>(({ event }) => {
  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        
        
      </Modal.Content>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {},
});
