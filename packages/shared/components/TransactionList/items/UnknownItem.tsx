import { CustomAccountEvent } from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface UnknownItemProps {
  event: CustomAccountEvent;
}

export const UnknownItem = memo<UnknownItemProps>((props) => {
  const { event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {
    
  }
});
