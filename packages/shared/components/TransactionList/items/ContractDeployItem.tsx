import { CustomAccountEvent, CustomContractDeployAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface ContractDeployItemProps {
  action: CustomContractDeployAction;
  event: CustomAccountEvent;
}

export const ContractDeployItem = memo<ContractDeployItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
