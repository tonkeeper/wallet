import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { ExtraListItem } from '../components/ExtraListItem';
import { List, View, Text, copyText } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import { CustomAccountEvent, CustomUnSubscribeAction } from '@tonkeeper/core/src/TonAPI';
import { useSubscription } from '../../../query/hooks/useSubscription';

interface UnSubscribeContentProps {
  action: CustomUnSubscribeAction;
  event: CustomAccountEvent;
}

export const UnSubscribeContent = memo<UnSubscribeContentProps>((props) => {
  const { action, event } = props;
  const subscription = useSubscription(action.subscription);

  return (
    <View>
      <DetailedInfoContainer>
        <Text type="h2" textAlign="center">
          {t('transactionDetails.unsubscription_title')}
        </Text>
        <DetailedActionTime destination={event.destination} timestamp={event.timestamp} />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
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
        <ExtraListItem extra={event.extra} />
      </List>
    </View>
  );
});
