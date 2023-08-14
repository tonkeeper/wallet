import { CustomAccountEvent, CustomJettonSwapAction } from '@tonkeeper/core/src/TonAPI';
import { List, Steezy, View, SText as Text, FastImage } from '@tonkeeper/uikit';
import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedHeader } from '../components/DetailedHeader';
import { ExtraListItem } from '../components/ExtraListItem';
import { formatter } from '../../../formatter';
import { memo, useMemo } from 'react';

import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';
import { fiatCurrencySelector } from '@tonkeeper/mobile/src/store/main';
import { useSelector } from 'react-redux';

interface JettonSwapContentProps {
  action: CustomJettonSwapAction;
  event: CustomAccountEvent;
}

export const JettonSwapContent = memo<JettonSwapContentProps>((props) => {
  const { action, event } = props;

  const fiatCurrency = useSelector(fiatCurrencySelector);
  const tokenPrice = useTokenPrice(action.jetton_master_in.address);

  const amount = useMemo(() => {
    const amountIn = action.amount_in;
    const amountOut = action.amount_in;

    return {
      in: formatter.formatNano(amountIn, {
        formatDecimals: action.jetton_master_in.decimals ?? 9,
        postfix: action.jetton_master_in.symbol,
        withoutTruncate: true,
        prefix: '+',
      }),
      out: formatter.formatNano(amountOut, {
        formatDecimals: action.jetton_master_out.decimals ?? 9,
        postfix: action.jetton_master_out.symbol,
        withoutTruncate: true,
        prefix: '-',
      }),
    };
  }, [action]);

  const fiatAmount = useMemo(() => {
    if (tokenPrice.fiat) {
      const decimals = action.jetton_master_in.decimals ?? 9;
      const amount = parseFloat(formatter.fromNano(action.amount_in, decimals));
      return formatter.format(tokenPrice.fiat * amount, {
        currency: fiatCurrency,
      });
    }
  }, [action.amount_in, tokenPrice.fiat, fiatCurrency, action.isFailed]);

  const sourceIn = {
    uri: action.jetton_master_in.image,
  };

  const sourceOut = {
    uri: action.jetton_master_out.image,
  };

  return (
    <View>
      <DetailedInfoContainer>
        <DetailedHeader>
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
        </DetailedHeader>
        <View style={styles.fiatText}>
          {fiatAmount && (
            <Text type="body1" color="textSecondary">
              {fiatAmount}
            </Text>
          )}
        </View>
        <DetailedActionTime
          destination={event.destination}
          timestamp={event.timestamp}
          langKey="swapped_date"
        />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <AddressListItem address={action.user_wallet.address} />
        <ExtraListItem extra={event.extra} />
      </List>
    </View>
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
