import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { List, copyText } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import { getFlag } from '@tonkeeper/mobile/src/utils/flags';

interface SmartContractActionContentProps {
  action: ActionItem<ActionType.SmartContractExec>;
}

export const SmartContractActionContent = memo<SmartContractActionContentProps>(
  (props) => {
    const { action } = props;

    return (
      <ActionModalContent action={action} label={t('activityActionModal.call_contract')}>
        <List>
          <AddressListItem address={action.payload.contract.address} bounceable />
          <List.Item
            onPress={copyText(action.payload.operation)}
            title={t('transactionDetails.operation')}
            value={action.payload.operation}
            titleType="secondary"
          />
          <ExtraListItem extra={action.event.extra} />
          {action.payload && (
            <List.Item
              onPress={copyText(action.payload.payload)}
              title={t('transactionDetails.payload')}
              value={action.payload.payload}
              titleType="secondary"
              valueMultiline
            />
          )}
        </List>
      </ActionModalContent>
    );
  },
);
