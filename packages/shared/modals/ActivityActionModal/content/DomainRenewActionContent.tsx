import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { List, ListItem, copyText } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
interface DomainRenewActionContentProps {
  action: ActionItem<ActionType.DomainRenew>;
}

export const DomainRenewActionContent = memo<DomainRenewActionContentProps>((props) => {
  const { action } = props;

  return (
    <ActionModalContent title={t('activityActionModal.domain_renew')} action={action}>
      <List>
        <ListItem
          titleType="secondary"
          onPress={copyText(action.payload.domain)}
          title={t('transactionDetails.domain')}
          value={action.payload.domain}
        />
        <ExtraListItem extra={action.event.extra} />
      </List>
    </ActionModalContent>
  );
});
