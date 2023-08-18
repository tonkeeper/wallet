import {
  CustomAccountEvent,
  CustomAccountEventActions,
} from '@tonkeeper/core/src/TonAPI';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ActionListItem } from '../ActionListItem';

interface SimplePreviewItemProps {
  action: CustomAccountEventActions;
  event: CustomAccountEvent;
}

export const SimplePreviewItem = memo<SimplePreviewItemProps>((props) => {
  const { action, event } = props;

  return <ActionListItem event={event} />;
});

const styles = StyleSheet.create({
  container: {},
});
