import { ActionListItem, ActionListItemProps } from '../ActionListItem';
import { ActionType } from '@tonkeeper/core';
import { Steezy } from '@tonkeeper/uikit';
import { memo } from 'react';
import { t } from '../../../i18n';

type DomainRenewActionListItemProps = ActionListItemProps<ActionType.DomainRenew>;

export const DomainRenewActionListItem = memo<DomainRenewActionListItemProps>((props) => {
  const { action } = props;
  const { payload } = action;
  const valueStyle = Steezy.useStyle(styles.value);

  return (
    <ActionListItem
      title={t('transactions.domain_renew')}
      value={'-'}
      subtitle={payload.domain}
      valueStyle={valueStyle}
      iconName="ic-domain-renew-28"
      {...props}
    />
  );
});

const styles = Steezy.create(({ colors }) => ({
  value: {
    color: colors.textSecondary,
  },
}));
