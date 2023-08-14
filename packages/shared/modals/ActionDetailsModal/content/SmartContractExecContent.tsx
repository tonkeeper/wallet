import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedAmount } from '../components/DetailedAmount';
import { ExtraListItem } from '../components/ExtraListItem';
import { List, View, copyText } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import {
  CustomAccountEvent,
  CustomSmartContractExecAction,
} from '@tonkeeper/core/src/TonAPI';

interface SmartContractExecContentProps {
  action: CustomSmartContractExecAction;
  event: CustomAccountEvent;
}

export const SmartContractExecContent = memo<SmartContractExecContentProps>((props) => {
  const { action, event } = props;

  return (
    <View>
      <DetailedInfoContainer>
        <DetailedAmount
          destination={event.destination}
          hideFiat={action.isFailed}
          amount={action.ton_attached}
        />
        <DetailedActionTime
          langKey="call_contract_date"
          destination={event.destination}
          timestamp={event.timestamp}
        />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <AddressListItem address={action.contract.address} />
        <List.Item
          onPress={copyText(action.operation)}
          title={t('transactionDetails.operation')}
          titleType="secondary"
          value={action.operation}
        />
        <ExtraListItem extra={event.extra} />
        {action.payload && (
          <List.Item
            onPress={copyText(action.payload)}
            title={t('transactionDetails.payload')}
            titleType="secondary"
            value={action.payload}
            valueMultiline
          />
        )}
      </List>
    </View>
  );
});
