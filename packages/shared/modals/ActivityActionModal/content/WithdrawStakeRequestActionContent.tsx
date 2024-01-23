import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { List, ListItem, copyText } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';
import { useHideableFormatter } from '@tonkeeper/mobile/src/core/HideableAmount/useHideableFormatter';
import { StakingIcon } from '../components/StakingIcon';
import { fiatCurrencySelector } from '@tonkeeper/mobile/src/store/main';
import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';
import { useSelector } from 'react-redux';
import { formatter } from '../../../formatter';

interface WithdrawStakeRequestActionContentProps {
  action: ActionItem<ActionType.WithdrawStakeRequest>;
}

export const WithdrawStakeRequestActionContent =
  memo<WithdrawStakeRequestActionContentProps>((props) => {
    const { action } = props;

    const { formatNano, format } = useHideableFormatter();

    const fiatCurrency = useSelector(fiatCurrencySelector);
    const tokenPrice = useTokenPrice(
      'ton',
      formatter.fromNano(action.amount?.value ?? '0'),
    );

    const formattedAmount = action.amount
      ? formatNano(action.amount.value, {
          decimals: action.amount.decimals,
          postfix: action.amount.symbol,
          withoutTruncate: true,
          formatDecimals: 9,
        })
      : null;

    const formattedFiat = action.amount
      ? format(tokenPrice.totalFiat, {
          currency: fiatCurrency,
        })
      : '';

    return (
      <ActionModalContent
        shouldShowFiatAmount={false} // TODO: is it actually should be here?
        title={t('activityActionModal.withdrawal_request')}
        header={<StakingIcon implementation={action.payload.implementation} />}
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
              subvalue={formattedFiat}
            />
          ) : null}

          <ExtraListItem extra={action.event.extra} />
        </List>
      </ActionModalContent>
    );
  });
