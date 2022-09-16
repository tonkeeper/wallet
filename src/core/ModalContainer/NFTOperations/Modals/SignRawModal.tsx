import React, { memo, useMemo } from 'react';
import { Icon, Text } from '$uikit';
import { Toast } from '$uikit/Toast/new';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { SignRawParams, TxBodyOptions } from '../TXRequest.types';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import { debugLog, ns } from '$utils';
import { t } from '$translation';
import { AccountEvent } from 'tonapi-sdk-js';
import { SignRawAction } from './SignRawAction';
import { store } from '$store';
import { Ton } from '$libs/Ton';
import * as S from '../NFTOperations.styles';
import { Modal, useNavigation } from '$libs/navigation';

interface SignRawModalProps {
  action: Awaited<ReturnType<NFTOperations['signRaw']>>;
  accountEvent: AccountEvent;
  options: TxBodyOptions;
  params: SignRawParams;
}

export const SignRawModal = memo<SignRawModalProps>((props) => {
  const { accountEvent, options, params, action } = props;
  
  const { footerRef, onConfirm } = useNFTOperationState(options, params);
  const unlockVault = useUnlockVault();

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();

    startLoading();

    const result = await action.send(privateKey);
    console.log(result);
  });

  const hasWarning = useMemo(() => {
    const getComment = (payload?: string) => {
      if (!payload) {
        return null;
      }
      try {
        const cell = Ton.base64ToCell(payload);
        return Ton.parseComment(cell!);
      } catch (err) {
        return null;
      }
    };

    return params.messages.some(
      (message) =>
        !getComment(message.payload) && (!!message.stateInit || !!message.payload),
    );
  }, [action, params.messages]);

  const actions = useMemo(() => {
    if (!accountEvent) {
      return [];
    }

    return accountEvent.actions.map((action, index) => ({
      action,
      message: params.messages[index],
    }));
  }, [accountEvent, params.messages]);

  const headerTitle = useMemo(() => {
    if (params.messages.length > 1) {
      return t('txActions.signRaw.title');
    }

    const action = accountEvent.actions[0];
    const type = [
      'tonTransfer',
      'contractDeploy',
      'jettonTransfer',
      'nftItemTransfer',
      'subscribe',
      'unSubscribe',
    ].find((type) => type in action);

    return type 
      ? t(`txActions.signRaw.types.${type}`) 
      : t('txActions.signRaw.types.unknownTransaction');
  }, [params.messages.length, accountEvent.actions]);

  return (
    <Modal>
      <Modal.Header title={headerTitle} />
      <Modal.ScrollView>
        <S.Container>
          {hasWarning && (
            <S.WaringContainer>
              <S.WarningInfo>
                <Text variant="label1" style={{ marginBottom: ns(4) }}>
                  {t('txActions.signRaw.warning_title')}
                </Text>
                <Text variant="body2" color="foregroundSecondary">
                  {t('txActions.signRaw.warning_caption')}
                </Text>
              </S.WarningInfo>
              <S.WarningIcon>
                <Icon name="ic-exclamationmark-triangle-36" color="accentOrange" />
              </S.WarningIcon>
            </S.WaringContainer>
          )}
        </S.Container>
        {actions.map(({ action, message }, index) => (
          <SignRawAction
            totalFee={accountEvent.fee}
            isOneMessage={params.messages.length === 1}
            key={`${action.type}-${index}`}
            message={message}
            action={action}
          />
        ))}
      </Modal.ScrollView>
      <Modal.Footer>
        <NFTOperationFooter onPressConfirm={handleConfirm} ref={footerRef} />
      </Modal.Footer>
    </Modal>
  );
});

export const useSignRawModal = () => {
  const nav = useNavigation();

  const open = async (
    params: SignRawParams, 
    options: TxBodyOptions
  ) => {
    const wallet = store.getState().wallet.wallet;
    if (!wallet) {
      return;
    }
  
    try {
      Toast.loading();
  
      const operations = new NFTOperations(wallet);
      const action = await operations.signRaw(params);
      const accountEvent = await action.estimateTx();
  
      console.log(accountEvent);
  
      if (accountEvent) {
        Toast.hide();
        
        nav.openModal('SignRaw', { // TODO: change for new naviagtion 
          accountEvent,
          options,
          params,
          action,
        });
      } else {
        Toast.fail('Wrong stateInit or payload, actions not found.');
      }
    } catch (err) {
      debugLog(err);   
  
      Toast.fail('Operation error, please make sure the params is correct');
    }
  }

  return { open };
}
