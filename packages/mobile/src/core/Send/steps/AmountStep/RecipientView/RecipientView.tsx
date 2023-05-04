import { SendRecipient } from '../../../Send.interface';
import React, { FC, memo } from 'react';
import * as S from './RecipientView.style';
import { useTranslator } from '$hooks';
import { isAndroid, maskifyAddress } from '$utils';
import { Icon } from '$uikit';
import { Account } from '@tonkeeper/core';

interface Props {
  recipient: SendRecipient | null;
  recipientAccountInfo: Account | null;
  goToAddress: () => void;
}

const RecipientViewComponent: FC<Props> = (props) => {
  const { recipient, recipientAccountInfo, goToAddress } = props;

  const t = useTranslator();

  const shortenedAddress = recipient ? maskifyAddress(recipient.address) : '';

  const name = recipient?.domain || recipient?.name || recipientAccountInfo?.name;

  const title = name ?? shortenedAddress;

  const subtitle = name ? shortenedAddress : '';

  return (
    <S.Touchable onPress={goToAddress}>
      <S.Container>
        <S.InfoContainer>
          <S.Label>{t('send_screen_steps.amount.recipient_label')}</S.Label>
          <S.Title numberOfLines={1}>{title}</S.Title>
          <S.SubTitle>{subtitle}</S.SubTitle>
        </S.InfoContainer>
        <S.IconTouchable onPress={goToAddress}>
          <Icon name="ic-pencil-16" color="foregroundPrimary" />
        </S.IconTouchable>
      </S.Container>
    </S.Touchable>
  );
};

export const RecipientView = memo(RecipientViewComponent);
