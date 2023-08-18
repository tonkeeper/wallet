import { CustomAccountEvent, CustomNftItemTransferAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface NftTransferItemProps {
  action: CustomNftItemTransferAction;
  event: CustomAccountEvent;
}

export const NftTransferItem = memo<NftTransferItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
