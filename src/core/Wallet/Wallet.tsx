import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { WalletProps } from './Wallet.interface';
import * as S from './Wallet.style';
import { Button, CurrencyIcon, Icon, NavBar, Text } from '$uikit';
import { useTranslator, useWalletInfo } from '$hooks';
import { openReceive, openRequireWalletModal, openSend } from '$navigation';
import { walletActions, walletSelector } from '$store/wallet';
import { FlatList, View } from 'react-native';
import { ns, toLocaleNumber } from '$utils';
import { CryptoCurrencies } from '$shared/constants';
import { toastActions } from '$store/toast';
import { IconNames } from '$uikit/Icon/generated.types';

const Action: FC<{
  onPress: () => void;
  icon: IconNames;
}> = ({ children, onPress, icon }) => {
  return (
    <S.Action
      onPress={onPress}
      contentViewStyle={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} color="foregroundPrimary" />
      <S.ActionLabelWrapper>
        <Text variant="label2">{children}</Text>
      </S.ActionLabelWrapper>
    </S.Action>
  );
};

export const Wallet: FC<WalletProps> = ({ route }) => {
  const currency = route.params.currency;
  const { wallet, address } = useSelector(walletSelector);
  const t = useTranslator();
  const dispatch = useDispatch();
  const [lockupDeploy, setLockupDeploy] = useState('loading');

  useEffect(() => {
    if (currency === CryptoCurrencies.Ton && wallet && wallet.ton.isLockup()) {
      wallet.ton
        .getWalletInfo(address[currency])
        .then((info: any) => {
          setLockupDeploy(['empty', 'uninit'].includes(info.status) ? 'deploy' : 'deployed');
        })
        .catch((err: any) => {
          dispatch(toastActions.fail(err.message));
        });
    }
  }, []);

  const currencyUpper = useMemo(() => {
    return currency?.toUpperCase();
  }, [currency]);

  const { amount, priceDiff, fiatInfo } = useWalletInfo(currency);

  const handleReceive = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    openReceive(currency);
  }, [currency, wallet]);

  const handleSend = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    openSend(currency);
  }, [currency, wallet]);

  const handleDeploy = useCallback(() => {
    setLockupDeploy('loading');
    dispatch(
      walletActions.deployWallet({
        onDone: () => setLockupDeploy('deployed'),
        onFail: () => setLockupDeploy('deploy'),
      }),
    );
  }, [dispatch]);

  return (
    <S.Wrap>
      <NavBar />
      <FlatList
        ListHeaderComponent={
          <>
            <S.Info>
              <CurrencyIcon currency={currency} size={72} />
              <S.AmountWrapper>
                <Text variant="h2">
                  {toLocaleNumber(amount)} {currencyUpper}
                </Text>
              </S.AmountWrapper>
              <S.FiatInfo>
                <S.FiatAmountWrapper>
                  <Text color={fiatInfo.color} variant="body1">
                    {fiatInfo.amount}
                    &nbsp;&nbsp;{'·'}&nbsp;&nbsp;
                    {fiatInfo.percentAbs}
                  </Text>
                </S.FiatAmountWrapper>
                {!!priceDiff && +amount > 0 && (
                  <Icon
                    name={+priceDiff > 0 ? 'ic-up-12' : 'ic-down-12'}
                    color={fiatInfo.color}
                  />
                )}
              </S.FiatInfo>
            </S.Info>
            <S.Actions>
              <Action icon="ic-arrow-down-16" onPress={handleReceive}>
                {t('wallet_receive')}
              </Action>
              <Action icon="ic-arrow-up-16" onPress={handleSend}>
                {t('wallet_send')}
              </Action>
            </S.Actions>
            {wallet && wallet.ton.isLockup() && (
              <View style={{ padding: ns(16) }}>
                <Button
                  onPress={handleDeploy}
                  disabled={lockupDeploy === 'deployed'}
                  isLoading={lockupDeploy === 'loading'}
                >
                  {lockupDeploy === 'deploy' ? 'Deploy Wallet' : 'Deployed'}
                </Button>
              </View>
            )}
          </>
        }
        keyExtractor={(_, index) => `${index}`}
        data={[]}
        renderItem={() => null}
      />
    </S.Wrap>
  );
};
