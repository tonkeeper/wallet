import React from 'react';
import { Action, ActionTypeEnum } from 'tonapi-sdk-js';
import { TonTransferAction as TonTransferActionData } from 'tonapi-sdk-js';
import * as S from '../NFTOperations.styles';
import { Highlight, Separator, Text } from '$uikit';
import { copyText } from '$hooks/useCopyText';
import { Ton } from '$libs/Ton';
import { t } from '$translation';
import { ListHeader } from '$uikit';

interface Props {
  action: Action;
  totalFee?: string;
  countActions: number;
}

export const SignRawAction = React.memo<Props>((props) => {
  const { action, totalFee, countActions } = props;

  if (action.type === ActionTypeEnum.TonTransfer) {
    return (
      <TonTransferAction 
        action={action[ActionTypeEnum.TonTransfer]}
        skipHeader={countActions === 1}
        totalFee={totalFee}
      /> 
    );
  }

  if (action.type === ActionTypeEnum.Unknown) {
    return (
      <UnknownAction 
        action={action[ActionTypeEnum.Unknown]}
        skipHeader={countActions === 1}
      /> 
    );
  } 

  return null;
});

interface TonTransferActionProps {
  action: TonTransferActionData;
  skipHeader?: boolean;
  totalFee?: string;
}

const TonTransferAction = React.memo<TonTransferActionProps>((props) => {
  const { action, skipHeader, totalFee } = props;
  const amount = Ton.formatAmount(action.amount);
  const address = Ton.formatAddress(
    action.recipient.address, 
    { cut: true }
  );

  return (
    <>
      {/* {!skipHeader && (
        <ListHeader title={t('txActions.signRaw.types.tonTransfer')} />
      )} */}
      <S.Container>
        <S.Info>
          <Highlight onPress={() => copyText(amount)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.amount')}</S.InfoItemLabel>
              <S.InfoItemValue>
                <Text variant="body1">{amount}</Text>
              </S.InfoItemValue>
            </S.InfoItem>
          </Highlight>
          <Separator />
          <Highlight onPress={() => copyText(address)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
              <S.InfoItemValueText>
                {address}
              </S.InfoItemValueText>
            </S.InfoItem>
          </Highlight>
          {Boolean(action.comment) && (
            <>
              <Separator />
              <Highlight onPress={() => copyText(address)}>
                <S.InfoItem>
                  <S.InfoItemLabel>{t('txActions.signRaw.comment')}</S.InfoItemLabel>
                  <S.InfoItemValueText>
                    {action.comment}
                  </S.InfoItemValueText>
                </S.InfoItem>
              </Highlight>
            </>
          )}
          {Boolean(totalFee) && (
            <>
              <Separator />
              <Highlight onPress={() => copyText(address)}>
                <S.InfoItem>
                  <S.InfoItemLabel>{t('txActions.fee')}</S.InfoItemLabel>
                  <S.InfoItemValueText>
                    {totalFee}
                  </S.InfoItemValueText>
                </S.InfoItem>
              </Highlight>
            </>
          )}
        </S.Info>
      </S.Container>
    </>
  );
});


interface UnknownActionProps {
  skipHeader?: boolean;
  action: {
    address: string;
    amount: string;
  }
}

const UnknownAction = React.memo<UnknownActionProps>(({ action, skipHeader }) => {
  const address = Ton.formatAddress(action.address, { cut: true });
  const amount = Ton.formatAmount(action.amount);

  return (
    <>
      {!skipHeader && (
        <ListHeader title={t('txActions.signRaw.types.unknownTransaction')} />
      )}
      <S.Container>
        <S.Info>
          <Highlight onPress={() => copyText(amount)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.amount')}</S.InfoItemLabel>
              <S.InfoItemValue>
                <Text variant="body1">{amount}</Text>
              </S.InfoItemValue>
            </S.InfoItem>
          </Highlight>
          <Separator />
          <Highlight onPress={() => copyText(address)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
              <S.InfoItemValueText>
                {address}
              </S.InfoItemValueText>
            </S.InfoItem>
          </Highlight>
        </S.Info>
      </S.Container>
    </>
  );
});
