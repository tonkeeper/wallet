import React, { FC, useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useSelector } from 'react-redux';

import { ExchangeMethodProps } from './ExchangeMethod.interface';
import { useExchangeMethodInfo } from '$hooks';
import { BottomSheet, Button, Text } from '$uikit';
import * as S from './ExchangeMethod.style';
import { openBuyFiat, openRequireWalletModal } from '$navigation';
import { CryptoCurrencies } from '$shared/constants';
import { walletSelector } from '$store/wallet';
import { CheckmarkItem } from '$uikit/CheckmarkItem';
import { t } from '$translation';
import { ExchangeDB } from './ExchangeDB';
import { trackEvent } from '$utils';

export const ExchangeMethod: FC<ExchangeMethodProps> = ({ methodId, onContinue }) => {
  const method = useExchangeMethodInfo(methodId);
  const { wallet } = useSelector(walletSelector);
  const [isDontShow, setIsDontShow] = React.useState(false);
  const [isClosed, setClosed] = useState(false);

  const handleContinue = useCallback(() => {
    setClosed(true);

    setTimeout(() => {
      if (!wallet) {
        return openRequireWalletModal();
      } else {
        trackEvent(`exchange_open`, { internal_id: methodId });

        if (onContinue) {
          onContinue();

          return;
        }

        openBuyFiat(CryptoCurrencies.Ton, methodId);
      }
    }, 500);

    if (isDontShow) {
      ExchangeDB.dontShowDetails(methodId);
    }
  }, [isDontShow, wallet, methodId, onContinue]);

  const handleLinkPress = useCallback(
    (url) => () => {
      Linking.openURL(url);
    },
    [],
  );

  return (
    <BottomSheet skipHeader triggerClose={isClosed}>
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
        <S.Links>
          {method.info_buttons.map((item) => (
            <S.Link key={item.url} onPress={handleLinkPress(item.url)}>
              <Text color="foregroundSecondary" variant="body1">
                {item.title}
              </Text>
            </S.Link>
          ))}
        </S.Links>
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
    </BottomSheet>
  );
};
