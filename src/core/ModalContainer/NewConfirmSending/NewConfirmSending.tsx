import React, { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import BigNumber from 'bignumber.js';

import { ConfirmSendingProps } from './ConfirmSending.interface';
import * as S from './ConfirmSending.style';
import { useExchangeMethodInfo, useTranslator } from '$hooks';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { walletActions, walletSelector } from '$store/wallet';
import { formatCryptoCurrency } from '$utils/currency';
import { getTokenConfig } from '$shared/dynamicConfig';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { Modal } from '$libs/navigation';
import {
  NFTOperationFooter,
  useNFTOperationState,
} from '../NFTOperations/NFTOperationFooter';
import { Separator } from '$uikit';

export const NewConfirmSending: FC<ConfirmSendingProps> = (props) => {
  const { currency, address, amount, comment, fee, isJetton, methodId } = props;

  const t = useTranslator();

  const dispatch = useDispatch();

  const method = useExchangeMethodInfo(methodId);

  const { footerRef, onConfirm } = useNFTOperationState();

  const { balances, wallet } = useSelector(walletSelector);

  const { decimals, jettonWalletAddress, currencyTitle } = useCurrencyToSend(
    currency,
    isJetton,
    72,
  );

  const doSend = onConfirm(async ({ startLoading }) => {
    startLoading();

    await new Promise<void>((resolve, reject) =>
      dispatch(
        walletActions.sendCoins({
          currency,
          amount,
          address,
          comment,
          isJetton,
          jettonWalletAddress,
          decimals,
          onDone: resolve,
          onFail: reject,
        }),
      ),
    );
  });

  const handleSend = useCallback(async () => {
    const amountWithFee = new BigNumber(amount).plus(fee);
    if (
      currency === CryptoCurrencies.Ton &&
      wallet &&
      wallet.ton.isLockup() &&
      new BigNumber(balances[currency]).isLessThan(amountWithFee)
    ) {
      Alert.alert(t('send_lockup_warning_title'), t('send_lockup_warning_caption'), [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('send_lockup_warning_submit_button'),
          onPress: () => doSend(),
          style: 'destructive',
        },
      ]);
    } else {
      doSend();
    }
  }, [amount, fee, currency, wallet, balances, t, doSend]);

  const feeCurrency = useMemo(() => {
    const tokenConfig = getTokenConfig(currency);
    if (tokenConfig && tokenConfig.blockchain === 'ethereum') {
      return CryptoCurrencies.Eth;
    } else if (isJetton) {
      return CryptoCurrencies.Ton;
    } else {
      return currency;
    }
  }, [currency, isJetton]);

  const feeValue = React.useMemo(() => {
    if (fee === '0') {
      return `? ${feeCurrency.toUpperCase()}`;
    }

    return `≈ ${formatCryptoCurrency(fee, feeCurrency, Decimals[feeCurrency])}`;
  }, [fee, feeCurrency]);

  const logo = useMemo(() => {
    if (method?.icon_url) {
      return <S.Logo source={{ uri: method.icon_url }} />;
    }

    return null;
  }, [method]);

  const title = useMemo(() => {
    if (method?.title) {
      return t('confirm_sending_method_title', { name: method.title });
    }

    return '';
  }, [method, t]);

  return (
    <Modal>
      <Modal.Header gradient />
      <Modal.ScrollView scrollEnabled={false}>
        <S.Container>
          <S.Center>
            <S.LogoContainer>{logo}</S.LogoContainer>
            <S.Title>{title}</S.Title>
          </S.Center>
          <S.Info>
            <S.InfoItem>
              <S.InfoItemLabel>{t('confirm_sending_amount')}</S.InfoItemLabel>
              <S.InfoItemValueText>
                {formatCryptoCurrency(amount, currencyTitle, decimals)}
              </S.InfoItemValueText>
            </S.InfoItem>
            <Separator />
            <S.InfoItem>
              <S.InfoItemLabel>{t('confirm_sending_fee')}</S.InfoItemLabel>
              <S.InfoItemValueText>{feeValue}</S.InfoItemValueText>
            </S.InfoItem>
            {!!comment && (
              <>
                <Separator />
                <S.InfoItem>
                  <S.InfoItemLabel>{t('confirm_sending_message')}</S.InfoItemLabel>
                  <S.InfoItemValueText>{comment}</S.InfoItemValueText>
                </S.InfoItem>
              </>
            )}
          </S.Info>
        </S.Container>
      </Modal.ScrollView>
      <Modal.Footer>
        <NFTOperationFooter onPressConfirm={handleSend} ref={footerRef} />
      </Modal.Footer>
    </Modal>
  );
};
