import React, { memo, useEffect, useMemo } from 'react';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { SignRawParams, TxBodyOptions } from '../TXRequest.types';
import { useUnlockVault } from '../useUnlockVault';
import { calculateMessageTransferAmount, delay } from '$utils';
import { debugLog } from '$utils/debugLog';
import { t } from '@tonkeeper/shared/i18n';
import { store, Toast } from '$store';
import { List, Modal, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';
import { SheetActions } from '@tonkeeper/router';
import {
  checkIsInsufficient,
  openInsufficientFundsModal,
} from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { TonConnectRemoteBridge } from '$tonconnect/TonConnectRemoteBridge';
import { formatter } from '$utils/formatter';
import { tk } from '$wallet';
import { MessageConsequences } from '@tonkeeper/core/src/TonAPI';
import {
  Address,
  ContractService,
  contractVersionsMap,
  TransactionService,
} from '@tonkeeper/core';
import { ActionListItemByType } from '@tonkeeper/shared/components/ActivityList/ActionListItemByType';
import { useGetTokenPrice } from '$hooks/useTokenPrice';
import { formatValue, getActionTitle } from '@tonkeeper/shared/utils/signRaw';
import { Buffer } from 'buffer';
import { trackEvent } from '$utils/stats';
import { Events, SendAnalyticsFrom } from '$store/models';
import { getWalletSeqno } from '@tonkeeper/shared/utils/wallet';
import { useWalletCurrency } from '@tonkeeper/shared/hooks';
import {
  ActionAmountType,
  ActionSource,
  ActionType,
  ActivityModel,
  AnyActionItem,
} from '$wallet/models/ActivityModel';

interface SignRawModalProps {
  consequences?: MessageConsequences;
  options: TxBodyOptions;
  params: SignRawParams;
  onSuccess?: (boc: string) => void;
  onDismiss?: () => void;
  redirectToActivity?: boolean;
  isBattery?: boolean;
}

export const SignRawModal = memo<SignRawModalProps>((props) => {
  const {
    options,
    params,
    onSuccess,
    onDismiss,
    consequences,
    isBattery,
    redirectToActivity,
  } = props;
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const unlockVault = useUnlockVault();

  const fiatCurrency = useWalletCurrency();
  const getTokenPrice = useGetTokenPrice();

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();

    startLoading();

    const contract = ContractService.getWalletContract(
      contractVersionsMap[vault.getVersion() ?? 'v4R2'],
      Buffer.from(vault.tonPublicKey),
      vault.workchain,
    );
    const boc = TransactionService.createTransfer(contract, {
      messages: TransactionService.parseSignRawMessages(params.messages),
      seqno: await getWalletSeqno(),
      sendMode: 3,
      secretKey: Buffer.from(privateKey),
    });

    await tk.wallet.tonapi.blockchain.sendBlockchainMessage(
      {
        boc,
      },
      { format: 'text' },
    );

    if (onSuccess) {
      trackEvent(Events.SendSuccess, { from: SendAnalyticsFrom.SignRaw });
      await delay(1750);
      onSuccess(boc);
    }
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
              is_wallet: true,
            },
            recipient: {
              address: message.address,
              is_scam: false,
              is_wallet: true,
            },
          },
        });
      });
    }
  }, [consequences, params.messages]);

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
  }, [consequences, fiatCurrency, getTokenPrice]);

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

    return undefined;
  };

  return (
    <Modal>
      <Modal.Header title={t('confirmSendModal.title')} />
      <Modal.ScrollView>
        <List style={styles.actionsList}>
          {actions.map((action) => (
            <View key={action.action_id}>
              <ActionListItemByType
                value={formatValue(action)}
                subvalue={amountToFiat(action)}
                title={getActionTitle(action)}
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
            {extra.isNegative
              ? t('confirmSendModal.network_fee')
              : t('confirmSendModal.refund')}
          </Text>
          <Text type="body2" color="textSecondary">
            ≈ {extra.value} · {extra.fiat}
          </Text>
        </View>
        {isBattery && (
          <View style={styles.withBatteryContainer}>
            <Text type="body2" color="textSecondary">
              {t('confirmSendModal.will_be_paid_with_battery')}
            </Text>
          </View>
        )}
        <Spacer y={16} />
      </Modal.ScrollView>
      <Modal.Footer>
        <NFTOperationFooter
          onPressConfirm={handleConfirm}
          redirectToActivity={redirectToActivity}
          ref={footerRef}
        />
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
  redirectToActivity = true,
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

    const contract = ContractService.getWalletContract(
      contractVersionsMap[wallet.ton.version],
      Buffer.from(wallet.ton.vault.tonPublicKey),
      wallet.ton.vault.workchain,
    );

    let consequences: MessageConsequences | null = null;
    let isBattery = false;
    try {
      const boc = TransactionService.createTransfer(contract, {
        messages: TransactionService.parseSignRawMessages(params.messages),
        seqno: await getWalletSeqno(),
        secretKey: Buffer.alloc(64),
      });
      consequences = await tk.wallet.tonapi.wallet.emulateMessageToWallet({
        boc,
      });

      if (!isBattery) {
        const totalAmount = calculateMessageTransferAmount(params.messages);
        const checkResult = await checkIsInsufficient(totalAmount);
        if (checkResult.insufficient) {
          Toast.hide();
          onDismiss?.();
          return openInsufficientFundsModal({
            totalAmount,
            balance: checkResult.balance,
          });
        }
      }

      Toast.hide();
    } catch (err) {
      console.log(err);
      debugLog('[SignRaw]: estimateTx error', JSON.stringify(err));

      const tonapiError = err?.response?.data?.error;
      const errorMessage = tonapiError ?? `no response; status code: ${err.status};`;

      Toast.fail(`Emulation error: ${errorMessage}`, { duration: 5000 });
    }

    push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: SignRawModal,
      params: {
        consequences,
        options,
        params,
        onSuccess,
        onDismiss,
        redirectToActivity,
        isBattery,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  withBatteryContainer: {
    paddingHorizontal: 32,
  },
  actionsList: {
    marginBottom: 0,
  },
});
