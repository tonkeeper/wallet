import React, { FC, useCallback, useRef, useState } from 'react';
import {BottomSheet, Button, CurrencyIcon, List, ListCell, Text} from '$uikit';
import * as S from './DeployModal.style';
import { useInstance, useTranslator, useWallet } from '$hooks';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { formatCryptoCurrency } from '$utils/currency';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';
import { DeployParams, TxResponseOptions } from '../TXRequest.types';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import {debugLog, toLocaleNumber} from '$utils';
import { toastActions } from '$store/toast';
import { useDispatch } from 'react-redux';

export type DeployModalProps = {
  params: DeployParams;
  responseOptions: TxResponseOptions;
}

export const DeployModal: FC<DeployModalProps> = (props) => {
  const { address, amount, text } = props.params;
  
  const t = useTranslator();
  const dispatch = useDispatch();
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [isSent, setSent] = useState(false);
  const [isSending, setSending] = useState(false);
  const [fee, setFee] = React.useState('~');

  const wallet = useWallet();
  const unlockVault = useUnlockVault();
  const operations = useInstance(() => {
    return new NFTOperations(wallet);
  });

  React.useEffect(() => {
    operations
      .deploy(props.params)
      .then((operation) => operation.estimateFee())
      .then((fee) => setFee(fee))
      .catch((err) =>  {
        dispatch(toastActions.fail(err));
        debugLog('[deploy estimate fee]:', err)
      });
  }, []);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const confirm = React.useCallback(async () => {
    try {
      setSending(true);
      const vault = await unlockVault();
      const privateKey = await vault.getTonPrivateKey();
      const operation = await operations.deploy(props.params);
      const deploy = await operation.send(privateKey);

      console.log('DEPLOY', deploy);

      setSent(true);
    } catch (err) {
      console.log(err);
      dispatch(toastActions.fail(err?.message));
    } finally {
      setSending(false);
    }
  }, []);

  function renderContent() {
    if (isSent) {
      return (
        <>
          <S.Wrap>
            <CurrencyIcon currency={CryptoCurrencies.Ton} size={72} />
            <S.TitleWrapper>
              <Text variant="h2" textAlign="center">
                {t('confirm_sending_sent_title')}
              </Text>
            </S.TitleWrapper>
            <S.CaptionWrapper>
              <Text color="foregroundSecondary" variant="body1" textAlign="center">
                {t('confirm_sending_sent_caption_ton')}
              </Text>
            </S.CaptionWrapper>
          </S.Wrap>
          <S.Buttons>
            <Button onPress={closeBottomSheet}>{t('continue')}</Button>
          </S.Buttons>
        </>
      );
    } else {
      return (
        <S.ListWrap>
          <List align="left">
            <ListCell label={t('confirm_sending_recipient')}>{address}</ListCell>
            <ListCell label={t('confirm_sending_amount')}>
              {formatCryptoCurrency(
                amount,
                CryptoCurrencies.Ton,
                Decimals[CryptoCurrencies.Ton],
              )}
            </ListCell>
            <ListCell label={t('confirm_sending_fee')}>
              {toLocaleNumber(fee)} TON
            </ListCell>
            {!!text && (
              <ListCell label={t('confirm_sending_message')}>{text}</ListCell>
            )}
          </List>
          <S.SendButton 
            isLoading={isSending} 
            onPress={confirm}
            disabled={fee === '~'}
          >
            {t('deploy_contract_button')}
          </S.SendButton>
        </S.ListWrap>
      );
    }
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      title={t('deploy_contract_title')}
      skipHeader={isSent}
    >
      {renderContent()}
    </BottomSheet>
  );
};
