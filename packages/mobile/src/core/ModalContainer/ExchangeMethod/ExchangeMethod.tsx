import React, { FC, useCallback } from 'react';
import { Linking } from 'react-native';
import { useSelector } from 'react-redux';

import { ExchangeMethodProps } from './ExchangeMethod.interface';
import { useExchangeMethodInfo } from '$hooks/useExchangeMethodInfo';
import { Button, Text } from '$uikit';
import * as S from './ExchangeMethod.style';
import { openBuyFiat } from '$navigation';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { CryptoCurrencies } from '$shared/constants';
import { CheckmarkItem } from '$uikit/CheckmarkItem';
import { t } from '@tonkeeper/shared/i18n';
import { ExchangeDB } from './ExchangeDB';
import { trackEvent } from '$utils/stats';
import { push } from '$navigation/imperative';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { Modal, View } from '@tonkeeper/uikit';
import { useWallet } from '@tonkeeper/shared/hooks';

export const ExchangeMethod: FC<ExchangeMethodProps> = ({ methodId, onContinue }) => {
  const method = useExchangeMethodInfo(methodId);
  const wallet = useWallet();
  const [isDontShow, setIsDontShow] = React.useState(false);
  const nav = useNavigation();

  const handleContinue = useCallback(() => {
    nav.goBack();

    setTimeout(() => {
      if (!wallet) {
        return openRequireWalletModal();
      } else {
        trackEvent('exchange_open', { internal_id: methodId });

        if (onContinue) {
          onContinue();

          return;
        }

        openBuyFiat(CryptoCurrencies.Ton, methodId);
      }
    }, 800);

    if (isDontShow) {
      ExchangeDB.dontShowDetails(methodId);
    }
  }, [nav, isDontShow, wallet, methodId, onContinue]);

  const handleLinkPress = useCallback(
    (url) => () => {
      Linking.openURL(url);
    },
    [],
  );

  if (method === null) {
    return null;
  }

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={{ marginBottom: 16 }}>
          <S.Wrap>
            <S.Icon source={{ uri: method.icon_url }} />
            <S.TitleWrapper>
              <Text textAlign="center" variant="h3">
                {method.title}
              </Text>
            </S.TitleWrapper>
            <S.CaptionWrapper>
              <Text textAlign="center" color="foregroundSecondary" variant="body1">
                {method.description}
              </Text>
            </S.CaptionWrapper>
          </S.Wrap>
          <S.WarningContainer>
            <Text variant="body1">{t('exchange_method_open_warning')}</Text>
            {method.info_buttons && method.info_buttons.length > 0 ? (
              <S.Links>
                {method.info_buttons.map((item) => (
                  <S.Link key={item.url} onPress={handleLinkPress(item.url)}>
                    <Text color="foregroundSecondary" variant="body1">
                      {item.title}
                    </Text>
                  </S.Link>
                ))}
              </S.Links>
            ) : null}
          </S.WarningContainer>
          <S.Buttons>
            <Button onPress={handleContinue}>{method.action_button.title}</Button>
            <S.CheckmarkContainer>
              <CheckmarkItem
                onChange={(value) => setIsDontShow(value)}
                selected={isDontShow}
                label={t('exchange_method_dont_show_again')}
              />
            </S.CheckmarkContainer>
          </S.Buttons>
        </View>
      </Modal.Content>
    </Modal>
  );
};

export async function openExchangeMethodModal(methodId: string, onContinue?: () => void) {
  const isShowDetails = await ExchangeDB.isShowDetails(methodId);
  if (isShowDetails) {
    push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: ExchangeMethod,
      params: {
        methodId,
        onContinue,
      },
      path: 'EXCHANGE_METHOD',
    });
  } else {
    if (onContinue) {
      onContinue();
      return;
    }

    openBuyFiat(CryptoCurrencies.Ton, methodId);
  }
}
