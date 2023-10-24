import React from 'react';
import { openJettonsList } from '$navigation';
import { CryptoCurrencies, LockupNames } from '$shared/constants';
import { walletActions } from '$store/wallet';
import { Steezy } from '$styles';
import { t } from '@tonkeeper/shared/i18n';
import { Button, View } from '$uikit';
import { List } from '$uikit';
import { TonIcon } from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ListItemRate } from './ListItemRate';
import { openWallet } from '$core/Wallet/Wallet';

interface TokenListProps {
  tokens: any; // TODO: add types
  balance: any; // TODO: add types
  rates: any; // TODO: add types
}

export const TokenList = memo<TokenListProps>(({ tokens, balance, rates }) => {
  const dispatch = useDispatch();

  const handleMigrate = useCallback(
    (fromVersion: string) => () => {
      dispatch(
        walletActions.openMigration({
          isTransfer: true,
          fromVersion,
        }),
      );
    },
    [],
  );

  return (
    <View>
      <List>
        <List.Item
          title="Toncoin"
          onPress={() => openWallet(CryptoCurrencies.Ton)}
          value={balance.amount.formatted}
          subvalue={balance.amount.fiat}
          leftContent={<TonIcon />}
          subtitle={
            <ListItemRate
              percent={rates.percent}
              price={rates.price}
              trend={rates.trend}
            />
          }
        />
        {balance.lockup.map((item, key) => (
          <List.Item
            key={`lockup-${key}`}
            title={LockupNames[item.type]}
            value={item.amount.formatted}
            subvalue={item.amount.fiat}
            leftContent={<TonIcon locked />}
            subtitle={rates.price}
          />
        ))}
        {balance.oldVersions.map((item, key) => (
          <List.Item
            key={`old-balance-${key}`}
            onPress={handleMigrate(item.version)}
            title={t('wallet.old_wallet_title')}
            leftContent={<TonIcon transparent />}
            value={item.amount.formatted}
            subvalue={item.amount.fiat}
            subtitle={
              <ListItemRate
                percent={rates.percent}
                price={rates.price}
                trend={rates.trend}
              />
            }
          />
        ))}
        {tokens.list.map((item) => (
          <List.Item
            key={item.address.rawAddress}
            onPress={() => openJetton(item.address.rawAddress)}
            picture={item.iconUrl}
            title={item.name}
            value={item.quantity.formatted}
            label={item.symbol}
            // TODO:
            // subvalue={item.rate?.fiatValue}
            // subtitle={item.rate && (
            //   <ListItemRate
            //     percent={item.rate.percent}
            //     price={item.rate.fiatPrice}
            //     trend={item.rate.trend}
            //   />
            // )}
          />
        ))}
      </List>
      {tokens.canEdit && (
        <View style={styles.tonkensEdit}>
          <Button
            onPress={() => openJettonsList()}
            size="medium_rounded"
            mode="secondary"
          >
            {t('wallet.edit_tokens_btn')}
          </Button>
        </View>
      )}
    </View>
  );
});

const styles = Steezy.create({
  tonkensEdit: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
});
