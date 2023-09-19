import React, { memo, useEffect, useMemo } from 'react';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { SignRawParams, TxBodyOptions } from '../TXRequest.types';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import {
  calculateActionsTotalAmount,
  calculateMessageTransferAmount,
  delay,
} from '$utils';
import { debugLog } from '$utils/debugLog';
import { t } from '@tonkeeper/shared/i18n';
import { store, Toast } from '$store';
import { Modal, View, Text, Steezy, List } from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';
import { SheetActions } from '@tonkeeper/router';
import {
  checkIsInsufficient,
  openInsufficientFundsModal,
} from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { TonConnectRemoteBridge } from '$tonconnect/TonConnectRemoteBridge';
import { formatter } from '$utils/formatter';
import { approveAll } from '$store/zustand/tokenApproval/helpers';
import { tk, tonapi } from '@tonkeeper/shared/tonkeeper';
import { MessageConsequences } from '@tonkeeper/core/src/TonAPI';
import {
  ActionAmountType,
  ActionSource,
  ActionType,
  ActivityModel,
  Address,
  AnyActionItem,
} from '@tonkeeper/core';
import { ActionListItemByType } from '@tonkeeper/shared/components/ActivityList/ActionListItemByType';
import { useSelector } from 'react-redux';
import { fiatCurrencySelector } from '$store/main';
import { useGetTokenPrice } from '$hooks/useTokenPrice';

interface SignRawModalProps {
  action: Awaited<ReturnType<NFTOperations['signRaw']>>;
  consequences?: MessageConsequences;
  options: TxBodyOptions;
  params: SignRawParams;
  onSuccess?: (boc: string) => void;
  onDismiss?: () => void;
}

export const SignRawModal = memo<SignRawModalProps>((props) => {
  const { options, params, action, onSuccess, onDismiss, consequences } = props;
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const unlockVault = useUnlockVault();

  const fiatCurrency = useSelector(fiatCurrencySelector);
  const getTokenPrice = useGetTokenPrice();

  const tokensToApprove = useMemo(() => {
    const tokens = consequences?.event.actions
      .map((action) => ({
        address:
          (action.type === 'ContractDeploy' && action[action.type]?.address) ||
          action[action.type]?.nft?.collection?.address ||
          action[action.type]?.nft?.address ||
          action[action.type]?.nft ||
          action[action.type]?.jetton?.address,
        isCollection: !!action[action.type]?.nft?.collection?.address,
      }))
      .filter((token) => !!token.address);

    return tokens;
  }, [consequences]);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();

    startLoading();

    await action.send(privateKey, async (boc) => {
      if (onSuccess) {
        await delay(1750);
        approveAll(tokensToApprove ?? []);
        onSuccess(boc);
      }
    });
  });

  useEffect(() => {
    return () => {
      onDismiss?.();
    };
  }, []);

  const actions = useMemo(() => {
    if (consequences) {
      return ActivityModel.createActions({
        ownerAddress: tk.wallet.address.ton.raw,
        events: [consequences.event],
        source: ActionSource.Ton,
      });
    } else {
      // convert messages to TonTransfer actions
      return params.messages.map((message) => {
        return ActivityModel.createMockAction(tk.wallet.address.ton.raw, {
          type: ActionType.TonTransfer,
          payload: {
            amount: Number(message.amount),
            sender: {
              address: message.address,
              is_scam: false,
            },
            recipient: {
              address: message.address,
              is_scam: false,
            },
          },
        });
      });
    }
  }, [consequences]);

  const extra = useMemo(() => {
    if (consequences) {
      const extra = formatter.fromNano(consequences.event.extra ?? 0, 9);
      const tonPrice = getTokenPrice('ton');
      const fiatAmount = tonPrice.fiat * parseFloat(extra);

      return {
        isNegative: formatter.isNegative(extra),
        value: formatter.format(extra, {
          ignoreZeroTruncate: true,
          withoutTruncate: true,
          postfix: 'TON',
          absolute: true,
        }),
        fiat: formatter.format(fiatAmount, {
          currency: fiatCurrency,
          absolute: true,
        }),
      };
    } else {
      const defaultExtra = '0.003';
      return {
        isNegative: false,
        value: defaultExtra,
        fiat: formatter.format(defaultExtra, {
          currencySeparator: 'wide',
          currency: fiatCurrency,
          absolute: true,
          decimals: 9,
        }),
      };
    }
  }, [consequences]);

  const amountToFiat = (action: AnyActionItem) => {
    if (action.amount) {
      const tokenPrice =
        action.amount.type === ActionAmountType.Jetton
          ? getTokenPrice(Address.parse(action.amount.jettonAddress).toFriendly())
          : getTokenPrice('ton');
      if (tokenPrice.fiat) {
        const parsedAmount = parseFloat(
          formatter.fromNano(action.amount.value, action.amount.decimals),
        );
        return formatter.format(tokenPrice.fiat * parsedAmount, {
          currency: fiatCurrency,
        });
      }
    }

    return null;
  };

  return (
    <Modal>
      <Modal.Header title={t('confirmSendModal.title')} />
      <Modal.ScrollView>
        <List style={styles.actionsList}>
          {actions.map((action) => (
            <View key={action.action_id}>
              <ActionListItemByType
                subvalue={amountToFiat(action)}
                disablePressable
                action={action}
                subtitle={
                  action.destination === 'in'
                    ? t('confirmSendModal.to_your_address')
                    : undefined
                }
              />
            </View>
          ))}
        </List>
        <View style={styles.feeContainer}>
          <Text type="body2" color="textSecondary">
            {t('confirmSendModal.network_fee')}
          </Text>
          <Text type="body2" color="textSecondary">
            ≈ {extra.value} · {extra.fiat}
          </Text>
        </View>
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

    let consequences: MessageConsequences | null = null;
    try {
      const boc = await action.getBoc();
      consequences = await tonapi.wallet.emulateMessageToWallet({ boc });

      Toast.hide();
    } catch (err) {
      console.log(err);
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

    if (params.messages) {
      const totalAmount = calculateActionsTotalAmount(params.messages);
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
        consequences,
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

const styles = Steezy.create({
  feeContainer: {
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsList: {
    marginBottom: 0,
  },
});
