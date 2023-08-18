import { CustomAccountEvent, CustomUnSubscribeAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface UnSubscribeItemProps {
  action: CustomUnSubscribeAction;
  event: CustomAccountEvent;
}

export const UnSubscribeItem = memo<UnSubscribeItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
