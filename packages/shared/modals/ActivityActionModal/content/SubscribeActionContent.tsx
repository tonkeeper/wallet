import { useSubscription } from '../../../query/hooks/useSubscription';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { Button, List, Steezy, Text, View, copyText } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

import { openSubscription } from '@tonkeeper/mobile/src/core/ModalContainer/CreateSubscription/CreateSubscription';

interface SubscribeActionContentProps {
  action: ActionItem<ActionType.Subscribe>;
}

export const SubscribeActionContent = memo<SubscribeActionContentProps>((props) => {
  const { action } = props;
  const subscription = useSubscription(action.payload.subscription);

  return (
    <ActionModalContent action={action}>
      <List>
        {subscription && (
          <List.Item
            titleType="secondary"
            title={t('transactionDetails.subscription_merchant_label')}
            onPress={copyText(subscription.merchantName)}
            value={subscription.merchantName}
          />
        )}
        <ExtraListItem extra={action.event.extra} />
      </List>
      <View style={styles.buttonContainer}>
        <Button
          title={t('transaction_show_subscription_button')}
          onPress={() => openSubscription(subscription, null, true)}
          color="secondary"
        />
      </View>
    </ActionModalContent>
  );
});

const styles = Steezy.create({
  buttonContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
