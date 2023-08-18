import { CustomAccountEvent, CustomJettonTransferAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface JettonTransferItemProps {
  action: CustomJettonTransferAction;
  event: CustomAccountEvent;
}

export const JettonTransferItem = memo<JettonTransferItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
