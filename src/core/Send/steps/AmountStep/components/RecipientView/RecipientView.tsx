import { SendRecipient } from '../../../../Send.interface';
import React, { FC, memo, useLayoutEffect } from 'react';
import * as S from './RecipientView.style';
import { useTranslator } from '$hooks';
import { isAndroid, maskifyAddress } from '$utils';
import { Icon } from '$uikit';
import { useState } from 'react';
import { useCallback } from 'react';
import { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { AccountRepr } from 'tonapi-sdk-js';

interface Props {
  recipient: SendRecipient | null;
  recipientAccountInfo: AccountRepr | null;
  goToAddress: () => void;
}

const RecipientViewComponent: FC<Props> = (props) => {
  const { recipient, recipientAccountInfo, goToAddress } = props;

  const t = useTranslator();

  const [titleWidth, setTitleWidth] = useState(0);

  const shortenedAddress = recipient ? maskifyAddress(recipient.address) : '';

  const name = recipient?.domain || recipient?.name || recipientAccountInfo?.name;

  const title = name ?? shortenedAddress;

  const subtitle = name ? shortenedAddress : '';

  const handleTitleTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (isAndroid) {
        return;
      }

      if (e.nativeEvent.lines.length > 1) {
        setTitleWidth(e.nativeEvent.lines[0]?.width || 0);
      }
    },
    [],
  );

  useLayoutEffect(() => {
    if (recipient) {
      setTitleWidth(0);
    }
  }, [recipient]);

  return (
    <S.Touchable onPress={goToAddress}>
      <S.Container>
        <S.InfoContainer>
          <S.Label>{t('send_screen_steps.amount.recipient_label')}</S.Label>
          <S.Title
            numberOfLines={1}
            width={titleWidth}
            onTextLayout={handleTitleTextLayout}
          >
            {title}
          </S.Title>
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
