import React, { memo, useMemo } from 'react';
import { Action, Fee } from 'tonapi-sdk-js';
import { SignRawMessage } from '../TXRequest.types';
import * as S from '../NFTOperations.styles';
import { Highlight, Separator, Text } from '$uikit';
import { copyText } from '$hooks/useCopyText';
import { maskifyAddress, truncateDecimal } from '$utils';
import { Ton } from '$libs/Ton';
import TonWeb from 'tonweb';
import { t } from '$translation';
import { ListHeader } from '$uikit';

interface Props {
  action: Action;
  message: SignRawMessage;
  isOneMessage: boolean;
  totalFee: Fee;
}

export const SignRawAction = memo<Props>((props) => {
  const { action, message, isOneMessage, totalFee } = props;

  const title = useMemo(() => {
    if (isOneMessage) {
      return false;
    }

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
  }, [action, isOneMessage]);

  const comment = useMemo(() => {
    if (message.payload) {
      try {
        const cell = Ton.base64ToCell(message.payload);
        return Ton.parseComment(cell!);
      } catch (err) {
        return null;
      }
    }
  }, [message.payload]);

  if (action.tonTransfer) {
    const amount = String(action.tonTransfer.amount);
    const amountText = `${Ton.fromNano(amount)} TON`;

    const recipientAddress = new TonWeb.utils.Address(
      action.tonTransfer.recipient.address,
    ).toString(true, true, true);

    const totalFeeText = useMemo(() => {
      return `${truncateDecimal(Ton.fromNano(totalFee.total.toString()), 1, true)} TON`;
    }, []);

    return (
      <>
        {title && ( 
          <ListHeader title={title} />
        )}
        <S.Container>
          <S.Info>
            <Highlight onPress={() => copyText(amountText)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('txActions.amount')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  <Text variant="body1">{amountText}</Text>
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(recipientAddress)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
                <S.InfoItemValueText>
                  {maskifyAddress(recipientAddress, 4)}
                </S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            {isOneMessage && (
              <Highlight onPress={() => copyText(totalFeeText)}>
                <S.InfoItem>
                  <S.InfoItemLabel>{t('transaction_fee')}</S.InfoItemLabel>
                  <S.InfoItemValueText>
                    ≈ {totalFeeText}
                  </S.InfoItemValueText>
                </S.InfoItem>
              </Highlight>
            )}
            <Separator />

            {!!comment && (
              <>
                <Separator />
                <Highlight onPress={() => copyText(comment)}>
                  <S.InfoItem>
                    <S.InfoItemLabel>{t('txActions.signRaw.comment')}</S.InfoItemLabel>
                    <S.InfoItemValue>
                      <Text variant="body1">{comment}</Text>
                    </S.InfoItemValue>
                  </S.InfoItem>
                </Highlight>
              </>
            )}
          </S.Info>
        </S.Container>
      </>
    );
  }

  return null;
});