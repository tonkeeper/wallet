import { ActionModalContent } from '../ActionModalContent';
import { Text } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';

interface ContractDeployActionContentProps {
  action: ActionItem<ActionType.ContractDeploy>;
}

export const ContractDeployActionContent = memo<ContractDeployActionContentProps>(
  (props) => {
    const { action } = props;

    return (
      <ActionModalContent
        action={action}
        header={
          <Text type="h2" textAlign="center">
            {t('transactions.wallet_initialized')}
          </Text>
        }
      />
    );
  },
);
