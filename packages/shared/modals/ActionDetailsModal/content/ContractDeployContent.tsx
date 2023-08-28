import { ContractDeployActionData, TransactionEvent } from '@tonkeeper/core';
import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { ExtraListItem } from '../components/ExtraListItem';
import { List, View, Text } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface ContractDeployContentProps {
  action: ContractDeployActionData;
  event: TransactionEvent;
}

export const ContractDeployContent = memo<ContractDeployContentProps>((props) => {
  const { action, event } = props;

  return (
    <View>
      <DetailedInfoContainer>
        <Text type="h2" textAlign="center">
          {t('transactions.wallet_initialized')}
        </Text>
        <DetailedActionTime
          destination={action.destination}
          timestamp={event.timestamp}
        />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <ExtraListItem extra={event.extra} />
      </List>
    </View>
  );
});
