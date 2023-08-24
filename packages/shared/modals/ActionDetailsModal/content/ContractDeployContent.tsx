import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { ExtraListItem } from '../components/ExtraListItem';
import { List, View, Text } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import {
  CustomAccountEvent,
  CustomContractDeployAction,
} from '@tonkeeper/core/src/TonAPI';

interface ContractDeployContentProps {
  action: CustomContractDeployAction;
  event: CustomAccountEvent;
}

export const ContractDeployContent = memo<ContractDeployContentProps>((props) => {
  const { action, event } = props;

  return (
    <View>
      <DetailedInfoContainer>
        <Text type="h2" textAlign="center">
          {action.walletInitialized
            ? t('transactions.wallet_initialized')
            : t('transactions.contract_deploy')}
        </Text>
        <DetailedActionTime destination={event.destination} timestamp={event.timestamp} />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <ExtraListItem extra={event.extra} />
      </List>
    </View>
  );
});
