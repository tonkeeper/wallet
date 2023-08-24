import { Steezy, Modal, View } from '@tonkeeper/uikit';
import { useTransaction } from '@tonkeeper/core/src/query/useTransaction';
import { memo } from 'react';
import { usePrepareDetailedAction } from '$hooks/usePrepareDetailedAction';
import { ActionBase } from '$core/ModalContainer/Action/ActionBase/ActionBase';

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
