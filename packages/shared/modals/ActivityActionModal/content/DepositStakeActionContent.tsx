import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { FastImage, List, Steezy } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import { getImplementationIcon } from '@tonkeeper/mobile/src/utils/staking';

interface DepositStakeActionContentProps {
  action: ActionItem<ActionType.DepositStake>;
}

export const DepositStakeActionContent = memo<DepositStakeActionContentProps>((props) => {
  const { action } = props;

  return (
    <ActionModalContent
      label={t('activityActionModal.deposit')}
      header={
        <FastImage
          style={styles.stakingImage}
          resizeMode="cover"
          source={getImplementationIcon(action.payload.implementation)}
        />
      }
      action={action}
    >
      <List>
        <AddressListItem
          recipient={action.payload.pool}
          hideName={action.event.is_scam}
          destination="out"
          bounceable
        />
        <ExtraListItem extra={action.event.extra} />
      </List>
    </ActionModalContent>
  );
});

const styles = Steezy.create(({ colors }) => ({
  stakingImage: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
    backgroundColor: colors.backgroundContent,
  },
}));
