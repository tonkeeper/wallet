import { CustomAccountEvent, CustomAuctionBidAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface AuctionBidItemProps {
  action: CustomAuctionBidAction;
  event: CustomAccountEvent;
}

export const AuctionBidItem = memo<AuctionBidItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
