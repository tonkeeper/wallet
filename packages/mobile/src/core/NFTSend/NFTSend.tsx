import { AccountWithPubKey, SendRecipient } from '$core/Send/Send.interface';
import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { NavBar } from '$uikit';
import { RouteProp } from '@react-navigation/native';
import React, {
  FC,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { t } from '@tonkeeper/shared/i18n';
import { AddressStep } from '$core/Send/steps/AddressStep/AddressStep';
import { NFTSendSteps } from '$core/NFTSend/types';
import { ConfirmStep } from '$core/NFTSend/steps/ConfirmStep/ConfirmStep';
import {
  BASE_FORWARD_AMOUNT,
  ContractService,
  encryptMessageComment,
  ONE_TON,
  TransactionService,
} from '@tonkeeper/core';
import { getWalletSeqno, setBalanceForEmulation } from '@tonkeeper/shared/utils/wallet';
import { Buffer } from 'buffer';
import { MessageConsequences } from '@tonkeeper/core/src/TonAPI';
import {
  Address,
  Cell,
  SendMode,
  internal,
  toNano,
  comment as commentCell,
} from '@ton/core';
import BigNumber from 'bignumber.js';
import { Ton } from '$libs/Ton';
import { delay } from '$utils';
import { Toast } from '$store';
import axios from 'axios';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import {
  emulateBoc,
  getTimeoutFromLiteserverSafely,
  sendBoc,
} from '@tonkeeper/shared/utils/blockchain';
import {
  checkIsInsufficient,
  openInsufficientFundsModal,
} from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';
import { Keyboard } from 'react-native';
import nacl from 'tweetnacl';
import { useInstance } from '$hooks/useInstance';
import { AccountsApi, Configuration } from '@tonkeeper/core/src/legacy';
import { useIsEnabledForBattery, useWallet } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { config } from '$config';
import { BatterySupportedTransaction } from '$wallet/managers/BatteryManager';

interface Props {
  route: RouteProp<AppStackParamList, AppStackRouteNames.NFTSend>;
}

export const NFTSend: FC<Props> = (props) => {
  const {
    route: {
      params: { nftAddress },
    },
  } = props;

  const isNFTSendEnabledWithRelayer = useIsEnabledForBattery(
    BatterySupportedTransaction.NFT,
  );
  const wallet = useWallet();
  const stepViewRef = useRef<StepViewRef>(null);

  const [currentStep, setCurrentStep] = useState<{
    id: NFTSendSteps;
    index: number;
  }>({
    id: NFTSendSteps.ADDRESS,
    index: 0,
  });

  const stepsScrollTop = useSharedValue(
    Object.keys(NFTSendSteps).reduce(
      (acc, cur) => ({ ...acc, [cur]: 0 }),
      {} as Record<NFTSendSteps, number>,
    ),
  );

  const nft = useMemo(
    () => wallet.nfts.getCachedByAddress(nftAddress),
    [nftAddress, wallet],
  );
  const scrollTop = useDerivedValue<number>(
    () => stepsScrollTop.value[currentStep.id] || 0,
  );

  const [comment, setComment] = useState('');

  const [recipient, setRecipient] = useState<SendRecipient | null>(null);
  const [recipientAccountInfo, setRecipientAccountInfo] =
    useState<AccountWithPubKey | null>(null);

  const handleBack = useCallback(() => stepViewRef.current?.goBack(), []);

  const handleChangeStep = useCallback((id: string | number, index: number) => {
    setCurrentStep({ id: id as NFTSendSteps, index });
  }, []);

  const hideBackButton = currentStep.index === 0;
  const hideTitle = currentStep.id === NFTSendSteps.CONFIRM;

  const [consequences, setConsequences] = useState<MessageConsequences | null>(null);
  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);
  const [isBattery, setIsBattery] = useState(false);
  const [isCommentEncrypted, setCommentEncrypted] = useState(false);
  const [encryptedCommentPrivateKey, setEncryptedCommentPrivateKey] =
    useState<Uint8Array | null>(null);

  const isBackDisabled = isSending || isPreparing;

  const unlockVault = useUnlockVault();

  const prepareConfirmSending = useCallback(async () => {
    try {
      setPreparing(true);

      let commentValue: Cell | string = comment;
      if (isCommentEncrypted) {
        const tempKeyPair = nacl.sign.keyPair();
        commentValue = await encryptMessageComment(
          comment,
          tempKeyPair.publicKey,
          tempKeyPair.publicKey,
          tempKeyPair.secretKey,
          wallet.address.ton.raw,
        );
      }

      const seqno = await getWalletSeqno();

      const timeout = await getTimeoutFromLiteserverSafely();

      const signer = await tk.wallet.signer.getSigner(true);

      const boc = await TransactionService.createTransfer(wallet.contract, signer, {
        timeout,
        messages: [
          internal({
            to: nftAddress,
            value: ONE_TON,
            body: ContractService.createNftTransferBody({
              newOwnerAddress: recipient!.address,
              excessesAddress: wallet.address.ton.raw,
              forwardBody: commentValue,
            }),
            bounce: true,
          }),
        ],
        seqno,
      });

      const response = await emulateBoc(
        boc,
        [setBalanceForEmulation(toNano('2'))], // Emulate with higher balance to calculate fair amount to send
        isNFTSendEnabledWithRelayer,
      );

      setConsequences(response.emulateResult);
      setIsBattery(response.battery);

      Keyboard.dismiss();
      await delay(100);

      stepViewRef.current?.go(NFTSendSteps.CONFIRM);
    } catch (e) {
      Toast.fail(
        axios.isAxiosError(e) && e.message === 'Network Error'
          ? t('error_network')
          : t('error_occurred'),
      );

      console.log(e);
    } finally {
      setPreparing(false);
    }
  }, [
    comment,
    isCommentEncrypted,
    isNFTSendEnabledWithRelayer,
    nftAddress,
    recipient,
    wallet,
  ]);

  const accountsApi = useInstance(() => {
    const tonApiConfiguration = new Configuration({
      basePath: config.get('tonapiV2Endpoint', tk.wallet.isTestnet),
      headers: {
        Authorization: `Bearer ${config.get('tonApiV2Key', tk.wallet.isTestnet)}`,
      },
    });

    return new AccountsApi(tonApiConfiguration);
  });

  const fetchRecipientAccountInfo = useCallback(async () => {
    if (!recipient) {
      setRecipientAccountInfo(null);
      return;
    }

    const accountId = recipient.address;

    try {
      const [accountInfoResponse, pubKeyResponse] = await Promise.allSettled([
        accountsApi.getAccount({ accountId }),
        accountsApi.getPublicKeyByAccountID({ accountId }),
      ]);

      if (accountInfoResponse.status === 'rejected') {
        throw new Error(accountInfoResponse.reason);
      }

      const accountInfo: AccountWithPubKey = { ...accountInfoResponse.value };

      if (pubKeyResponse.status === 'fulfilled') {
        accountInfo.publicKey = pubKeyResponse.value.publicKey;
      }

      if (!accountInfo.publicKey || accountInfo.memoRequired) {
        setCommentEncrypted(false);
      }

      setRecipientAccountInfo(accountInfo);
    } catch {}
  }, [accountsApi, recipient]);

  const handleSetCommentEncrypted = useCallback(
    async (value: boolean) => {
      try {
        if (value && !encryptedCommentPrivateKey) {
          const unlockedVault = await unlockVault(tk.wallet.identifier);

          const privateKey = await unlockedVault.getTonPrivateKey();

          setEncryptedCommentPrivateKey(privateKey);
        }

        setCommentEncrypted(value);
      } catch {}
    },
    [encryptedCommentPrivateKey, unlockVault],
  );

  useLayoutEffect(() => {
    fetchRecipientAccountInfo();
  }, [fetchRecipientAccountInfo]);

  const total = useMemo(() => {
    const extra = new BigNumber(Ton.fromNano(consequences?.event.extra ?? 0));

    return { amount: extra.abs().toString(), isRefund: !extra.isNegative() };
  }, [consequences?.event.extra]);

  const sendTx = useCallback(async () => {
    try {
      setSending(true);

      const seqno = await getWalletSeqno();

      const timeout = await getTimeoutFromLiteserverSafely();

      const pendingTransactions = await tk.wallet.battery.getStatus();
      if (pendingTransactions.length) {
        Toast.fail(t('transfer_pending_by_battery_error'));
        await delay(200);
        throw new CanceledActionError();
      }

      let commentValue: Cell | string = comment;
      if (isCommentEncrypted && comment.length && encryptedCommentPrivateKey) {
        const recipientPubKey = (
          await tk.wallet.tonapi.accounts.getAccountPublicKey(recipient!.address)
        ).public_key;

        commentValue = await encryptMessageComment(
          comment,
          Buffer.from(wallet.pubkey, 'hex'),
          Buffer.from(recipientPubKey!, 'hex'),
          encryptedCommentPrivateKey,
          wallet.address.ton.raw,
        );
      }

      const totalAmount = total.isRefund
        ? BASE_FORWARD_AMOUNT
        : BigInt(Math.abs(consequences?.event.extra!)) + BASE_FORWARD_AMOUNT;

      const checkResult = await checkIsInsufficient(totalAmount.toString(), tk.wallet);
      if (!isBattery && checkResult.insufficient) {
        stepViewRef.current?.go(NFTSendSteps.ADDRESS);
        openInsufficientFundsModal({
          totalAmount: totalAmount.toString(),
          balance: checkResult.balance,
        });

        await delay(200);
        throw new CanceledActionError();
      }

      let boc: string;

      // TODO: doesn't work on Ledger now
      // if (wallet.isLedger) {
      //   const transfer = await wallet.signer.signLedgerTransaction({
      //     to: Address.parse(nftAddress),
      //     bounce: true,
      //     amount: totalAmount,
      //     seqno,
      //     timeout,
      //     sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      //     payload: {
      //       type: 'nft-transfer',
      //       queryId: ContractService.getWalletQueryId(),
      //       newOwner: Address.parse(recipient!.address),
      //       responseDestination: Address.parse(wallet.address.ton.raw),
      //       forwardAmount: BigInt(1),
      //       forwardPayload: comment.length > 0 ? commentCell(comment) : null,
      //       customPayload: null,
      //     },
      //   });

      //   boc = TransactionService.externalMessage(wallet.contract, seqno, transfer)
      //     .toBoc()
      //     .toString('base64');
      // }

      const excessesAccount = isBattery && tk.wallet.battery.excessesAccount;

      const signer = await tk.wallet.signer.getSigner();

      boc = await TransactionService.createTransfer(wallet.contract, signer, {
        timeout,
        messages: [
          internal({
            to: nftAddress,
            value: totalAmount,
            body: ContractService.createNftTransferBody({
              newOwnerAddress: recipient!.address,
              excessesAddress: excessesAccount || wallet.address.ton.raw,
              forwardBody: commentValue,
            }),
            bounce: true,
          }),
        ],
        seqno,
        sendMode: 3,
      });

      await sendBoc(boc, isBattery);
    } catch (e) {
      throw e;
    } finally {
      setSending(false);
    }
  }, [
    comment,
    consequences?.event.extra,
    encryptedCommentPrivateKey,
    isBattery,
    isCommentEncrypted,
    nftAddress,
    recipient,
    total.isRefund,
    wallet,
  ]);

  if (!nft) {
    return null;
  }

  return (
    <>
      <NavBar
        isModal
        isClosedButton
        isForceBackIcon
        hideBackButton={hideBackButton}
        hideTitle={hideTitle}
        scrollTop={scrollTop}
        onBackPress={handleBack}
      >
        {t('send_screen_steps.address.title')}
      </NavBar>
      <StepView
        ref={stepViewRef}
        onChangeStep={handleChangeStep}
        initialStepId={NFTSendSteps.ADDRESS}
        useBackHandler
        backDisabled={isBackDisabled}
      >
        <StepViewItem id={NFTSendSteps.ADDRESS}>
          {(stepProps) => (
            <AddressStep
              recipient={recipient}
              enableEncryption={!tk.wallet.isExternal}
              decimals={9}
              stepsScrollTop={stepsScrollTop}
              setRecipient={setRecipient}
              setRecipientAccountInfo={setRecipientAccountInfo}
              recipientAccountInfo={recipientAccountInfo}
              comment={comment}
              isCommentEncrypted={isCommentEncrypted}
              setCommentEncrypted={handleSetCommentEncrypted}
              setComment={setComment}
              onContinue={prepareConfirmSending}
              {...stepProps}
            />
          )}
        </StepViewItem>
        <StepViewItem id={NFTSendSteps.CONFIRM}>
          {(stepProps) => (
            <ConfirmStep
              isBattery={isBattery}
              isCommentEncrypted={isCommentEncrypted}
              recipient={recipient}
              recipientAccountInfo={recipientAccountInfo}
              decimals={9}
              total={total}
              nftCollection={nft.collection?.name}
              nftName={nft.name}
              nftIcon={nft.image.medium!}
              stepsScrollTop={stepsScrollTop}
              isPreparing={isPreparing}
              sendTx={sendTx}
              comment={comment}
              {...stepProps}
            />
          )}
        </StepViewItem>
      </StepView>
    </>
  );
};
