import { CustomAccountEvent, CustomJettonSwapAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface JettonSwapItemProps {
  action: CustomJettonSwapAction;
  event: CustomAccountEvent;
}

export const JettonSwapItem = memo<JettonSwapItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
