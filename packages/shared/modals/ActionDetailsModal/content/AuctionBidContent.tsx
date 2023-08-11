import { CustomAccountEvent, CustomAuctionBidAction } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface AuctionBidContentProps {
  action: CustomAuctionBidAction;
  event: CustomAccountEvent;
}

export const AuctionBidContent = memo<AuctionBidContentProps>((props) => {
  return <View style={styles.container}></View>;
});

const styles = StyleSheet.create({
  container: {},
});
