import { AccountWithPubKey, SendRecipient } from '$core/Send/Send.interface';
import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { NavBar } from '$uikit';
import { RouteProp } from '@react-navigation/native';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { t } from '@tonkeeper/shared/i18n';
import { AddressStep } from '$core/Send/steps/AddressStep/AddressStep';
import { NFTSendSteps } from '$core/NFTSend/types';
import { ConfirmStep } from '$core/NFTSend/steps/ConfirmStep/ConfirmStep';
import { useNFT } from '$hooks/useNFT';
import {
  ContractService,
  contractVersionsMap,
  TransactionService,
} from '@tonkeeper/core';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { getWalletSeqno } from '@tonkeeper/shared/utils/wallet';
import { Buffer } from 'buffer';
import { MessageConsequences } from '@tonkeeper/core/src/TonAPI';
import { internal, MessageRelaxed, toNano } from '@ton/core';
import BigNumber from 'bignumber.js';
import { Ton } from '$libs/Ton';
import { delay } from '$utils';
import { Toast } from '$store';
import axios from 'axios';
import { useWallet } from '$hooks/useWallet';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import {
  emulateWithBattery,
  sendBocWithBattery,
} from '@tonkeeper/shared/utils/blockchain';

interface Props {
  route: RouteProp<AppStackParamList, AppStackRouteNames.NFTSend>;
}

export const NFTSend: FC<Props> = (props) => {
  const {
    route: {
      params: { nftAddress },
    },
  } = props;

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

  const nft = useNFT({ currency: 'ton', address: nftAddress });
  const scrollTop = useDerivedValue<number>(
    () => stepsScrollTop.value[currentStep.id] || 0,
  );

  const [comment, setComment] = useState('');

  const [recipient, setRecipient] = useState<SendRecipient | null>(null);
  const [recipientAccountInfo, setRecipientAccountInfo] =
    useState<AccountWithPubKey | null>(null);
  const messages = useRef<MessageRelaxed[]>([]);

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

  const isBackDisabled = isSending || isPreparing;

  const unlockVault = useUnlockVault();

  const prepareConfirmSending = useCallback(async () => {
    try {
      setPreparing(true);

      const nftTransferMessages = [
        internal({
          to: nftAddress,
          value: toNano('1'),
          body: ContractService.createNftTransferBody({
            queryId: Date.now(),
            newOwnerAddress: recipient!.address,
            excessesAddress: tk.wallet.address.ton.raw,
            forwardBody: comment,
          }),
          bounce: true,
        }),
      ];

      const contract = ContractService.getWalletContract(
        contractVersionsMap[wallet.ton.version ?? 'v4R2'],
        Buffer.from(await wallet.ton.getTonPublicKey()),
      );

      const boc = TransactionService.createTransfer(contract, {
        messages: nftTransferMessages,
        seqno: await getWalletSeqno(),
        secretKey: Buffer.alloc(64),
      });
      const response = await emulateWithBattery(boc);
      messages.current = nftTransferMessages;
      setConsequences(response.emulateResult);
      setIsBattery(response.battery);

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
  }, [comment, nftAddress, recipient, wallet.ton]);

  const sendTx = useCallback(async () => {
    try {
      setSending(true);

      const vault = await unlockVault();
      const privateKey = await vault.getTonPrivateKey();

      const contract = ContractService.getWalletContract(
        contractVersionsMap[vault.getVersion() ?? 'v4R2'],
        Buffer.from(vault.tonPublicKey),
      );
      const boc = TransactionService.createTransfer(contract, {
        messages: messages.current,
        seqno: await getWalletSeqno(),
        sendMode: 3,
        secretKey: Buffer.from(privateKey),
      });

      await sendBocWithBattery(boc);
    } catch (e) {
      throw e;
    } finally {
      setSending(false);
    }
  }, [unlockVault]);

  const total = useMemo(() => {
    const fee = new BigNumber(Ton.fromNano(consequences?.event.extra ?? 0));

    return { amount: fee.abs().toString(), isRefund: !fee.isNegative() };
  }, [consequences?.event.extra]);

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
              decimals={9}
              stepsScrollTop={stepsScrollTop}
              setRecipient={setRecipient}
              setRecipientAccountInfo={setRecipientAccountInfo}
              recipientAccountInfo={recipientAccountInfo}
              comment={comment}
              enableEncryption={false}
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
              recipient={recipient}
              recipientAccountInfo={recipientAccountInfo}
              decimals={9}
              total={total}
              nftCollection={nft.collection?.name}
              nftName={nft.name}
              nftIcon={nft.content.image.baseUrl}
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
