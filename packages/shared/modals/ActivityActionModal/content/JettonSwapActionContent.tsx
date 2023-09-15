import { Steezy, View, SText as Text, FastImage } from '@tonkeeper/uikit';
import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';
import { fiatCurrencySelector } from '@tonkeeper/mobile/src/store/main';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { formatter } from '../../../formatter';
import { useSelector } from 'react-redux';
import { memo, useMemo } from 'react';
import { t } from '../../../i18n';

interface JettonSwapActionContentProps {
  action: ActionItem<ActionType.JettonSwap>;
}

export const JettonSwapActionContent = memo<JettonSwapActionContentProps>((props) => {
  const { action } = props;

  const fiatCurrency = useSelector(fiatCurrencySelector);
  const tokenPrice = useTokenPrice(action.payload.jetton_master_in.address);

  const isFailed = action.status === ActionStatusEnum.Failed;

  const amount = useMemo(() => {
    const amountIn = action.payload.amount_in;
    const amountOut = action.payload.amount_in;

    return {
      in: formatter.formatNano(amountIn, {
        formatDecimals: action.payload.jetton_master_in.decimals ?? 9,
        postfix: action.payload.jetton_master_in.symbol,
        withoutTruncate: true,
        prefix: '+',
      }),
      out: formatter.formatNano(amountOut, {
        formatDecimals: action.payload.jetton_master_out.decimals ?? 9,
        postfix: action.payload.jetton_master_out.symbol,
        withoutTruncate: true,
        prefix: '-',
      }),
    };
  }, [action]);

  const fiatAmount = useMemo(() => {
    if (tokenPrice.fiat) {
      const decimals = action.payload.jetton_master_in?.decimals ?? 9;
      const amount = parseFloat(formatter.fromNano(action.payload.amount_in, decimals));
      return formatter.format(tokenPrice.fiat * amount, {
        currency: fiatCurrency,
      });
    }
  }, [action.payload.amount_in, tokenPrice.fiat, fiatCurrency, isFailed]);

  const sourceIn = {
    uri: action.payload.jetton_master_in.image,
  };

  const sourceOut = {
    uri: action.payload.jetton_master_out.image,
  };

  return (
    <ActionModalContent
      label={t('activityActionModal.swapped')}
      action={action}
      header={
        <>
          <View style={styles.content}>
            <View style={styles.swapImages}>
              <FastImage
                style={styles.jettonInImage}
                resizeMode="cover"
                source={sourceIn}
              />
              <View style={styles.jettonOutImageContainer}>
                <FastImage
                  style={styles.jettonOutImage}
                  resizeMode="cover"
                  source={sourceOut}
                />
              </View>
            </View>
          </View>
          <Text type="h2" style={styles.amountText} color="textTertiary">
            {amount.out}
          </Text>
          <Text type="h2" style={styles.amountText}>
            {amount.in}
          </Text>
        </>
      }
    >
      <ExtraListItem extra={action.event.extra} />
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
  jettonInImage: {
    width: 72,
    height: 72,
    borderRadius: 72 / 2,
    marginRight: -6,
    backgroundColor: colors.backgroundContent,
  },
  jettonOutImage: {
    width: 72,
    height: 72,
    borderRadius: 72 / 2,
    backgroundColor: colors.backgroundContent,
  },
  jettonOutImageContainer: {
    borderWidth: 4,
    borderColor: colors.backgroundPage,
    marginLeft: -6,
    borderRadius: 72 + 4 / 2,
  },
  fiatText: {
    marginTop: -16,
  },
}));
