import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { FastImage, List, ListItem, Steezy, copyText } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import { getImplementationIcon } from '@tonkeeper/mobile/src/utils/staking';
import { useHideableFormatter } from '@tonkeeper/mobile/src/core/HideableAmount/useHideableFormatter';

interface WithdrawStakeRequestActionContentProps {
  action: ActionItem<ActionType.WithdrawStakeRequest>;
}

export const WithdrawStakeRequestActionContent =
  memo<WithdrawStakeRequestActionContentProps>((props) => {
    const { action } = props;

    const { formatNano, format } = useHideableFormatter();

    const formattedAmount = action.amount
      ? formatNano(action.amount.value, {
          decimals: action.amount.decimals,
          postfix: action.amount.symbol,
          withoutTruncate: true,
          formatDecimals: 9,
        })
      : null;

    return (
      <ActionModalContent
        title={t('activityActionModal.withdrawal_request')}
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
            destination={action.destination}
            hideName={action.event.is_scam}
            sender={action.payload.pool}
            bounceable
          />
          {formattedAmount ? (
            <ListItem
              onPress={copyText(action.amount!.value)}
              titleType="secondary"
              title={t('transactionDetails.withdraw_amount')}
              value={formattedAmount}
            />
          ) : null}

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
