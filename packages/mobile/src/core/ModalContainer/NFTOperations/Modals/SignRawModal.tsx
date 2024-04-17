import React, { memo, useEffect, useMemo } from 'react';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { SignRawParams, TxBodyOptions } from '../TXRequest.types';
import { useUnlockVault } from '../useUnlockVault';
import { calculateMessageTransferAmount, delay } from '$utils';
import { debugLog } from '$utils/debugLog';
import { t } from '@tonkeeper/shared/i18n';
import { Toast } from '$store';
import {
  List,
  Modal,
  Spacer,
  Steezy,
  Text,
  View,
  WalletIcon,
  isAndroid,
  Icon,
  ListItemContent,
} from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';
import { SheetActions, useNavigation } from '@tonkeeper/router';
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
import { JettonTransferAction, NftItemTransferAction } from 'tonapi-sdk-js';
import { TokenDetailsParams } from '../../../../components/TokenDetails/TokenDetails';
import { ModalStackRouteNames } from '$navigation';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';
import { emulateBoc, sendBoc } from '@tonkeeper/shared/utils/blockchain';

interface SignRawModalProps {
  consequences?: MessageConsequences;
  options: TxBodyOptions;
  params: SignRawParams;
  onSuccess?: (boc: string) => void;
  onDismiss?: () => void;
  redirectToActivity?: boolean;
  isBattery?: boolean;
  walletIdentifier: string;
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
    walletIdentifier,
  } = props;
  const wallet = useMemo(() => tk.wallets.get(walletIdentifier), [walletIdentifier]);
  const nav = useNavigation();

  if (!wallet) {
    throw new Error('wallet is not found');
  }

  const { footerRef, onConfirm } = useNFTOperationState(options, wallet);
  const unlockVault = useUnlockVault();

  const fiatCurrency = useWalletCurrency();
  const getTokenPrice = useGetTokenPrice();

  const handleOpenTokenDetails = (tokenDetailsParams: TokenDetailsParams) => () =>
    nav.navigate(ModalStackRouteNames.TokenDetails, tokenDetailsParams);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const pendingTransactions = await tk.wallet.battery.getStatus();
    if (pendingTransactions.length) {
      Toast.fail(t('transfer_pending_by_battery_error'));
      await delay(200);
      throw new CanceledActionError();
    }
    const vault = await unlockVault(wallet.identifier);
    const privateKey = await vault.getTonPrivateKey();

    startLoading();

    const contract = ContractService.getWalletContract(
      contractVersionsMap[vault.getVersion() ?? 'v4R2'],
      Buffer.from(vault.tonPublicKey),
      vault.workchain,
    );

    const boc = TransactionService.createTransfer(contract, {
      messages: TransactionService.parseSignRawMessages(
        params.messages,
        isBattery ? await tk.wallet.battery.getExcessesAccount() : undefined,
      ),
      seqno: await getWalletSeqno(wallet),
      sendMode: 3,
      secretKey: Buffer.from(privateKey),
    });

    await sendBoc(boc, isBattery);

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
  }, [onDismiss]);

  const actions = useMemo(() => {
    if (consequences) {
      return ActivityModel.createActions({
        ownerAddress: wallet.address.ton.raw,
        events: [consequences.event],
        source: ActionSource.Ton,
      });
    } else {
      // convert messages to TonTransfer actions
      return params.messages.map((message) => {
        return ActivityModel.createMockAction(wallet.address.ton.raw, {
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
  }, [consequences, params.messages, wallet]);

  const extra = useMemo(() => {
    if (consequences) {
      const extra = formatter.fromNano(consequences.event.extra ?? 0, 9);
      const tonPrice = getTokenPrice('ton');
      const fiatAmount = tonPrice.fiat * parseFloat(extra);

      return {
        isNegative: formatter.isNegative(extra),
        value: formatter.format(extra, {
          decimals: 4,
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

  const totalRiskedAmount = useMemo(() => {
    if (consequences?.risk) {
      return wallet.compareWithTotal(consequences.risk.ton, consequences.risk.jettons);
    }
  }, [consequences, wallet]);

  return (
    <Modal>
      <Modal.Header
        numberOfLines={1}
        title={t('confirmSendModal.title')}
        subtitle={
          tk.wallets.size > 1 && (
            <View style={styles.subtitleContainer}>
              <Text type="body2" color="textSecondary">
                {t('confirmSendModal.wallet')}
              </Text>
              <WalletIcon
                emojiStyle={styles.emoji.static}
                size={20}
                value={wallet.config.emoji}
              />
              <Text type="body2" color="textSecondary">
                {wallet.config.name}
              </Text>
            </View>
          )
        }
      />
      <Modal.ScrollView>
        <List style={styles.actionsList}>
          {actions.map((action) => (
            <View key={action.action_id}>
              <ActionListItemByType
                value={formatValue(action)}
                subvalue={amountToFiat(action)}
                title={getActionTitle(action)}
                disableNftPreview={true}
                disablePressable={
                  !(
                    (action.payload as any as JettonTransferAction)?.jetton ||
                    (action.payload as any as NftItemTransferAction)?.nft
                  )
                }
                onPress={handleOpenTokenDetails({
                  jetton: (action.payload as any as JettonTransferAction)?.jetton,
                  nft: (action.payload as any as NftItemTransferAction)?.nft,
                })}
                action={action}
                subtitle={
                  action.destination === 'in'
                    ? t('confirmSendModal.to_your_address')
                    : undefined
                }
              />
            </View>
          ))}
          <List.Item
            leftContent={
              <ListItemContent style={styles.icon.static}>
                <Icon name={'ic-ton-28'} color="iconSecondary" />
              </ListItemContent>
            }
            subvalue={extra.fiat}
            subtitle={isBattery && t('confirmSendModal.will_be_paid_with_battery')}
            title={
              extra.isNegative
                ? t('confirmSendModal.network_fee')
                : t('confirmSendModal.refund')
            }
            value={`≈ ${extra.value}`}
          />
        </List>
        <Spacer y={16} />
      </Modal.ScrollView>
      <Modal.Footer>
        <NFTOperationFooter
          onPressConfirm={handleConfirm}
          redirectToActivity={redirectToActivity}
          ref={footerRef}
        />
        {totalRiskedAmount ? (
          <Text
            color={totalRiskedAmount.isDangerous ? 'accentOrange' : 'textSecondary'}
            type="body2"
            textAlign="center"
          >
            {t('confirmSendModal.total_risk', {
              totalAmount: formatter.format(totalRiskedAmount.totalFiat, {
                currency: fiatCurrency,
              }),
            })}
            {consequences?.risk.nfts.length > 0 &&
              ` + ${consequences?.risk.nfts.length} NFT`}
          </Text>
        ) : null}
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
  walletIdentifier?: string,
) => {
  const wallet = walletIdentifier ? tk.wallets.get(walletIdentifier) : tk.wallet;

  if (!wallet) {
    return false;
  }

  try {
    Toast.loading();

    if (isTonConnect) {
      await TonConnectRemoteBridge.closeOtherTransactions();
    }

    const contract = ContractService.getWalletContract(
      contractVersionsMap[wallet.config.version],
      Buffer.from(wallet.pubkey, 'hex'),
      wallet.config.workchain,
    );

    let consequences: MessageConsequences | null = null;
    let isBattery = false;
    try {
      const boc = TransactionService.createTransfer(contract, {
        messages: TransactionService.parseSignRawMessages(params.messages),
        seqno: await getWalletSeqno(wallet),
        secretKey: Buffer.alloc(64),
      });

      const { emulateResult, battery } = await emulateBoc(
        boc,
        undefined,
        options.experimentalWithBattery,
      );
      consequences = emulateResult;
      isBattery = battery;

      if (!isBattery) {
        const totalAmount = calculateMessageTransferAmount(params.messages);
        const checkResult = await checkIsInsufficient(totalAmount, wallet);
        if (checkResult.insufficient) {
          Toast.hide();
          onDismiss?.();
          return openInsufficientFundsModal({
            totalAmount,
            balance: checkResult.balance,
            walletIdentifier,
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
        walletIdentifier: wallet.identifier,
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

const styles = Steezy.create(({ colors }) => ({
  icon: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundContentTint,
  },
  feeContainer: {
    paddingHorizontal: 32,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subtitleContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  withBatteryContainer: {
    paddingHorizontal: 32,
  },
  actionsList: {
    marginBottom: 0,
  },
  emoji: {
    fontSize: isAndroid ? 17 : 20,
    marginTop: isAndroid ? -1 : 1,
  },
}));
