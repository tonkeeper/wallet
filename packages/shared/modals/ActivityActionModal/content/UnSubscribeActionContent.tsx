import { useSubscription } from '../../../query/hooks/useSubscription';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { List, Text, copyText } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface UnSubscribeActionContentProps {
  action: ActionItem<ActionType.UnSubscribe>;
}

export const UnSubscribeActionContent = memo<UnSubscribeActionContentProps>((props) => {
  const { action } = props;
  const subscription = useSubscription(action.payload.subscription);

  return (
    <ActionModalContent
      action={action}
      header={
        <Text type="h2" textAlign="center">
          {t('transactionDetails.unsubscription_title')}
        </Text>
      }
    >
      {subscription && (
        <>
          <List.Item
            titleType="secondary"
            title={t('transactionDetails.subscription_product_label')}
            onPress={copyText(subscription.productName)}
            value={subscription.productName}
          />
          <List.Item
            titleType="secondary"
            title={t('transactionDetails.subscription_merchant_label')}
            onPress={copyText(subscription.merchantName)}
            value={subscription.merchantName}
          />
        </>
      )}
      <ExtraListItem extra={action.event.extra} />
    </ActionModalContent>
  );
});
