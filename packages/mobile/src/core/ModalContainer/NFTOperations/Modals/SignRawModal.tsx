import React, { memo, useEffect, useMemo } from 'react';
import { Highlight, Icon, Text } from '$uikit';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { SignRawParams, TxBodyOptions } from '../TXRequest.types';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import {
  calculateActionsTotalAmount,
  calculateMessageTransferAmount,
  delay,
  lowerCaseFirstLetter,
  ns,
} from '$utils';
import { debugLog } from '$utils/debugLog';
import { t } from '@tonkeeper/shared/i18n';
import { AccountEvent, ActionTypeEnum } from '@tonkeeper/core/src/legacy';
import { SignRawAction } from './SignRawAction';
import { store, Toast } from '$store';
import * as S from '../NFTOperations.styles';
import { Modal } from '@tonkeeper/uikit';
import { Ton } from '$libs/Ton';
import { copyText } from '$hooks/useCopyText';
import { push } from '$navigation/imperative';
import { SheetActions } from '@tonkeeper/router';
import {
  checkIsInsufficient,
  openInsufficientFundsModal,
} from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { TonConnectRemoteBridge } from '$tonconnect/TonConnectRemoteBridge';
import { formatter } from '$utils/formatter';
import { CryptoCurrencies } from '$shared/constants';

interface SignRawModalProps {
  action: Awaited<ReturnType<NFTOperations['signRaw']>>;
  accountEvent?: AccountEvent;
  options: TxBodyOptions;
  params: SignRawParams;
  onSuccess?: (boc: string) => void;
  onDismiss?: () => void;
}

export const SignRawModal = memo<SignRawModalProps>((props) => {
  const { accountEvent, options, params, action, onSuccess, onDismiss } = props;

  const { footerRef, onConfirm } = useNFTOperationState(options);
  const unlockVault = useUnlockVault();

  const actions = useMemo(() => {
    if (!accountEvent || accountEvent?.actions?.[0]?.type === 'Unknown') {
      return params.messages.map((message) => ({
        type: 'Unknown',
        Unknown: {
          address: message.address,
          amount: message.amount,
        },
      }));
    }

    return accountEvent.actions;
  }, [accountEvent, params.messages]);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();

    startLoading();

    await action.send(privateKey, async (boc) => {
      if (onSuccess) {
        await delay(1750);

        onSuccess(boc);
      }
    });
  });

  const hasWarning = useMemo(() => {
    return !accountEvent;
  }, [accountEvent]);

  const headerTitle = useMemo(() => {
    if (actions.length > 1) {
      return t('txActions.signRaw.title');
    }

    const action = actions[0] ?? {};

    if (action.type === ActionTypeEnum.AuctionBid) {
      return undefined;
    }

    if (action.type === ActionTypeEnum.NftItemTransfer) {
      return undefined;
    }

    const type = [
      'TonTransfer',
      'ContractDeploy',
      'JettonTransfer',
      'NftItemTransfer',
      'Subscribe',
      'UnSubscribe',
    ].find((type) => type in action);

    return type
      ? t(`txActions.signRaw.types.${lowerCaseFirstLetter(type)}`)
      : t('txActions.signRaw.types.unknownTransaction');
  }, [actions]);

  const totalFee = useMemo(() => {
    const fee = accountEvent?.fee;

    if (fee) {
      return {
        fee:
          '≈ ' +
          formatter.format(Ton.fromNano(fee.total.toString()), {
            currencySeparator: 'wide',
            currency: CryptoCurrencies.Ton.toLocaleUpperCase(),
            absolute: true,
          }),
        isNegative: fee.total < 0,
      };
    }
  }, [accountEvent]);

  useEffect(
    () => () => {
      onDismiss?.();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Modal>
      <Modal.Header title={headerTitle} />
      <Modal.ScrollView>
        <S.Container>
          {actions.length > 1 && totalFee && (
            <S.Info>
              <Highlight onPress={() => copyText(totalFee.fee)}>
                <S.InfoItem>
                  <S.InfoItemLabel>
                    {totalFee.isNegative
                      ? t('txActions.signRaw.totalRefund')
                      : t('txActions.signRaw.totalFee')}
                  </S.InfoItemLabel>
                  <S.InfoItemValue>
                    <Text variant="body1">{totalFee.fee}</Text>
                  </S.InfoItemValue>
                </S.InfoItem>
              </Highlight>
            </S.Info>
          )}
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
        {actions.map((action, index) => (
          <SignRawAction
            key={`${action.type}-${index}`}
            countActions={actions.length}
            totalFee={actions.length === 1 ? totalFee : undefined}
            action={action}
            params={params}
          />
        ))}
      </Modal.ScrollView>
      <Modal.Footer>
        <NFTOperationFooter onPressConfirm={handleConfirm} ref={footerRef} />
      </Modal.Footer>
    </Modal>
  );
});

export const openSignRawModal = async (
  params: SignRawParams,
  options: TxBodyOptions,
  onSuccess?: (boc: string) => void,
  onDismiss?: () => void,
  isTonConnect?: boolean,
) => {
  const wallet = store.getState().wallet.wallet;
  if (!wallet) {
    return false;
  }

  try {
    Toast.loading();

    if (isTonConnect) {
      await TonConnectRemoteBridge.closeOtherTransactions();
    }

    const operations = new NFTOperations(wallet);
    const action = await operations.signRaw(params);

    let accountEvent: AccountEvent | null = null;
    try {
      accountEvent = await action.estimateTx();
      Toast.hide();
    } catch (err) {
      debugLog('[SignRaw]: estimateTx error', JSON.stringify(err));

      const tonapiError = err?.response?.data?.error;
      const errorMessage = tonapiError ?? `no response; status code: ${err.status};`;

      // in case of error we should check current TON balance and show "insufficient funds" modal
      const totalAmount = calculateMessageTransferAmount(params.messages);
      const checkResult = await checkIsInsufficient(totalAmount);
      if (checkResult.insufficient) {
        Toast.hide();
        onDismiss?.();
        return openInsufficientFundsModal({ totalAmount, balance: checkResult.balance });
      }

      Toast.fail(`Emulation error: ${errorMessage}`, { duration: 5000 });
    }

    // failed event, check balance
    if (accountEvent?.fee.total === 0) {
      const address = await wallet.ton.getAddress();
      const totalAmount = calculateActionsTotalAmount(address, accountEvent.actions);
      const checkResult = await checkIsInsufficient(totalAmount);
      if (checkResult.insufficient) {
        Toast.hide();
        onDismiss?.();
        return openInsufficientFundsModal({ totalAmount, balance: checkResult.balance });
      }
    }

    push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: SignRawModal,
      params: {
        accountEvent,
        options,
        params,
        action,
        onSuccess,
        onDismiss,
      },
      path: 'SignRaw',
    });

    return true;
  } catch (err) {
    debugLog('[SignRaw]:', err);
    Toast.fail('Operation error, please make sure the params is correct');

    return false;
  }
};
