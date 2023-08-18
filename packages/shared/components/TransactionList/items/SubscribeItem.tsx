import { CustomAccountEvent, CustomSubscribeAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface SubscribeItemProps {
  action: CustomSubscribeAction;
  event: CustomAccountEvent;
}

export const SubscribeItem = memo<SubscribeItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
