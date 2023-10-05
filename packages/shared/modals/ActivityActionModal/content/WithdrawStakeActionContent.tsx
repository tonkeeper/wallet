import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { FastImage, List, Steezy } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import { getImplementationIcon } from '@tonkeeper/mobile/src/utils/staking';

interface WithdrawStakeActionContentProps {
  action: ActionItem<ActionType.WithdrawStake>;
}

export const WithdrawStakeActionContent = memo<WithdrawStakeActionContentProps>(
  (props) => {
    const { action } = props;

    return (
      <ActionModalContent
        label={t('activityActionModal.withdraw')}
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
            hideName={action.event.is_scam}
            sender={action.payload.pool}
            destination="in"
            bounceable
          />
          <ExtraListItem extra={action.event.extra} />
        </List>
      </ActionModalContent>
    );
  },
);

const styles = Steezy.create(({ colors }) => ({
  stakingImage: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
    backgroundColor: colors.backgroundContent,
  },
}));
