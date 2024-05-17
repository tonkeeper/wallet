import { TonIconBackgroundColor } from '@tonkeeper/uikit/src/components/TonIcon';
import { Steezy, View, SText as Text, Picture, TonIcon, List } from '@tonkeeper/uikit';
import { useGetTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';
import { AmountFormatter } from '@tonkeeper/core';
import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { formatter } from '../../../formatter';
import { Address } from '../../../Address';
import { memo, useMemo } from 'react';
import { t } from '../../../i18n';

import { useHideableFormatter } from '@tonkeeper/mobile/src/core/HideableAmount/useHideableFormatter';
import { useWalletCurrency } from '../../../hooks';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';

interface JettonSwapActionContentProps {
  action: ActionItem<ActionType.JettonSwap>;
}

export const JettonSwapActionContent = memo<JettonSwapActionContentProps>((props) => {
  const { action } = props;
  const { payload } = action;
  const { format, formatNano } = useHideableFormatter();

  const fiatCurrency = useWalletCurrency();
  const getTokenPrice = useGetTokenPrice();

  const amountInFiat = useMemo(() => {
    if (payload.ton_in) {
      const tokenPrice = getTokenPrice('ton');
      if (tokenPrice.fiat) {
        const parsedAmount = parseFloat(formatter.fromNano(payload.ton_in, 9));
        return format(tokenPrice.fiat * parsedAmount, {
          currency: fiatCurrency,
          decimals: 9,
        });
      }
    } else if (payload.jetton_master_in) {
      const tokenPrice = getTokenPrice(
        Address.parse(payload.jetton_master_in.address).toFriendly(),
      );
      if (tokenPrice.fiat) {
        const parsedAmount = parseFloat(formatter.fromNano(payload.amount_in, 9));
        return format(tokenPrice.fiat * parsedAmount, {
          currency: fiatCurrency,
          decimals: 9,
        });
      }
    }
  }, [payload, getTokenPrice]);

  const amountIn = useMemo(() => {
    if (payload.ton_in) {
      return formatNano(payload.ton_in, {
        prefix: AmountFormatter.sign.minus,
        withoutTruncate: true,
        postfix: 'TON',
      });
    } else if (payload.jetton_master_in) {
      return formatNano(payload.amount_in, {
        decimals: payload.jetton_master_in.decimals,
        postfix: payload.jetton_master_in.symbol,
        prefix: AmountFormatter.sign.minus,
        withoutTruncate: true,
      });
    } else {
      return '';
    }
  }, [payload]);

  const amountOut = useMemo(() => {
    if (payload.ton_out) {
      return formatNano(payload.ton_out, {
        prefix: AmountFormatter.sign.plus,
        withoutTruncate: true,
        postfix: 'TON',
      });
    } else if (payload.jetton_master_out) {
      return formatNano(payload.amount_out, {
        decimals: payload.jetton_master_out.decimals,
        postfix: payload.jetton_master_out.symbol,
        prefix: AmountFormatter.sign.plus,
        withoutTruncate: true,
      });
    } else {
      return '';
    }
  }, [payload]);

  const pictureIn = useMemo(() => {
    if (payload.jetton_master_in) {
      return <Picture style={styles.leftPicture} uri={payload.jetton_master_in.image} />;
    } else if (payload.ton_in) {
      return <TonIcon size="xlarge" style={styles.tonIcon} />;
    }

    return null;
  }, []);

  const pictureOut = useMemo(() => {
    if (payload.jetton_master_out) {
      return (
        <Picture style={styles.rightPicture} uri={payload.jetton_master_out.image} />
      );
    } else if (payload.ton_out) {
      return <TonIcon size="xlarge" style={styles.tonIcon} />;
    }

    return null;
  }, []);

  return (
    <ActionModalContent
      failReason={
        action.status === ActionStatusEnum.Failed &&
        t('transactions.failed_with_reason.swap_refund_no_liq')
      }
      label={t('activityActionModal.swapped')}
      amountFiat={amountInFiat}
      action={action}
      header={
        <>
          <View style={styles.content}>
            <View style={styles.swapImages}>
              {pictureIn}
              <View style={styles.pictureOutContainer}>{pictureOut}</View>
            </View>
          </View>
          <Text type="h2" style={styles.amountText} color="textTertiary">
            {amountIn}
          </Text>
          <Text type="h2" style={styles.amountText}>
            {amountOut}
          </Text>
        </>
      }
    >
      <List>
        <AddressListItem destination="out" recipient={payload.user_wallet} />
        <ExtraListItem extra={action.event.extra} />
      </List>
    </ActionModalContent>
  );
});

const styles = Steezy.create(({ colors }) => ({
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 16,
  },
  amountText: {
    textAlign: 'center',
  },
  swapImages: {
    position: 'relative',
    left: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tonIcon: {
    width: 72,
    height: 72,
    borderRadius: 72 / 2,
    marginRight: -8,
    backgroundColor: TonIconBackgroundColor,
  },
  leftPicture: {
    width: 72,
    height: 72,
    borderRadius: 72 / 2,
    marginRight: -8,
    backgroundColor: colors.backgroundContent,
  },
  rightPicture: {
    width: 72,
    height: 72,
    borderRadius: 72 / 2,
    backgroundColor: colors.backgroundContent,
  },
  pictureOutContainer: {
    borderColor: colors.backgroundPage,
    borderWidth: 4,
    marginLeft: -4,
    borderRadius: 72 + 4 / 2,
  },
  fiatText: {
    marginTop: -16,
  },
}));
