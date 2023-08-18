import { CustomAccountEvent, CustomNftPurchaseAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface NftPurchaseItemProps {
  action: CustomNftPurchaseAction;
  event: CustomAccountEvent;
}

export const NftPurchaseItem = memo<NftPurchaseItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
