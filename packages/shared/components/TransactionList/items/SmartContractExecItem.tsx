import { CustomAccountEvent, CustomAccountEventActions } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface SmartContractExecItemProps {
  action: CustomAccountEventActions;
  event: CustomAccountEvent;
}

export const SmartContractExecItem = memo<SmartContractExecItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
