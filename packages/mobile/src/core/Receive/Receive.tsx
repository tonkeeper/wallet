import React, { FC, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Clipboard from '@react-native-community/clipboard';
import { Share } from 'react-native';
import vkQr from '@vkontakte/vk-qr';
import Webview from 'react-native-webview';

import { ReceiveProps } from './Receive.interface';
import * as S from './Receive.style';
import { CurrencyIcon, Icon, NavBar, Text } from '$uikit';
import { walletSelector } from '$store/wallet';
import { deviceWidth, ns, triggerImpactLight } from '$utils';
import { useTranslator } from '$hooks';
import { toastActions } from '$store/toast';
import { CryptoCurrencies, TabletModalsWidth } from '$shared/constants';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';

export const Receive: FC<ReceiveProps> = ({ route }) => {
  const t = useTranslator();
  const dispatch = useDispatch();
  const qrSize = Math.min(deviceWidth, TabletModalsWidth) - ns(64) * 2 - ns(16) - ns(12);
  const { currency, jettonAddress, isJetton, isFromMainScreen } = route.params;
  const { currencyTitle, Logo } = useCurrencyToSend(
    isJetton && jettonAddress ? jettonAddress : currency,
    isJetton,
    76,
  );
  const { address } = useSelector(walletSelector);
  const [scrollTop, setScrollTop] = useState(0);

  // only useful for invoices (with amount included)
  const address2url = useCallback((addr: string) => {
    return 'ton://transfer/' + addr;
  }, []);

  const address4copy = useCallback((addr: string) => {
    return addr;
  }, []);

  const handleCopy = useCallback(() => {
    Clipboard.setString(address4copy(address[currency]));
    dispatch(toastActions.success(t('address_copied')));
    triggerImpactLight();
  }, [address4copy, address, currency, dispatch, t]);

  const handleShare = useCallback(() => {
    Share.share({
      message: address4copy(address[currency]),
    }).catch((err) => {
      console.log('cant share', err);
    });
  }, [address, address4copy, currency]);

  const handleScroll = useCallback(({ nativeEvent: { contentOffset } }) => {
    setScrollTop(contentOffset.y);
  }, []);

  const svgCode = useMemo(() => {
    return vkQr.createQR(address2url(address[currency]), {
      qrSize: qrSize,
      isShowLogo: false,
      foregroundColor: '#000',
    });
  }, [address, address2url, currency, qrSize]);

  function renderContent() {
    return (
      <S.ContentWrap>
        <S.Content onScroll={handleScroll} scrollEventThrottle={0}>
          <S.Info>
            {currency === CryptoCurrencies.Ton && !jettonAddress ? (
              <CurrencyIcon currency={CryptoCurrencies.Ton} size={72} />
            ) : (
              Logo
            )}
            <S.TitleWrapper>
              <Text textAlign="center" variant="h3">
                {isFromMainScreen
                  ? t('receive_ton_and_jettons')
                  : t('receive_title', {
                      currency: currencyTitle,
                    })}
              </Text>
            </S.TitleWrapper>
          </S.Info>
          <S.QRBlockWrap>
            <S.Block>
              <S.BlockTitleWrapper>
                <Text variant="label1">{t('receive_qr_title')}</Text>
              </S.BlockTitleWrapper>
              <S.QRCodeWrap>
                <S.QRCode size={qrSize}>
                  <S.QRHelper />
                  <Webview
                    scrollEnabled={false}
                    originWhitelist={['*']}
                    style={{
                      width: qrSize - ns(4),
                      height: qrSize - ns(4),
                      flex: 0,
                      alignSelf: 'center',
                      zIndex: 1,
                    }}
                    source={{
                      html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <style>
                            html, body, svg {
                              border: 0;
                              padding: 0;
                              margin: 0;
                              overflow: hidden;
                              background: white;
                            }
                          </style>
                          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover">
                        </head>
                        <body>${svgCode}</body>
                        </html>`,
                    }}
                  />
                </S.QRCode>
              </S.QRCodeWrap>
            </S.Block>
          </S.QRBlockWrap>
          <S.Block>
            <S.BlockTitleWrapper>
              <Text variant="label1">{t('receive_address_title')}</Text>
            </S.BlockTitleWrapper>
            <S.AddressWrapper>
              <Text color="foregroundSecondary" variant="label1" onPress={handleCopy}>
                {address[currency]}
              </Text>
            </S.AddressWrapper>
            <S.Actions>
              <S.Action onPress={handleCopy}>
                <Icon name="ic-copy-16" color="foregroundPrimary" />
                <S.ActionLabelWrapper>
                  <Text variant="label2">{t('receive_copy')}</Text>
                </S.ActionLabelWrapper>
              </S.Action>
              <S.Action onPress={handleShare} skipBorder>
                <Icon name="ic-share-16" color="foregroundPrimary" />
                <S.ActionLabelWrapper>
                  <Text variant="label2">{t('receive_share')}</Text>
                </S.ActionLabelWrapper>
              </S.Action>
            </S.Actions>
          </S.Block>
        </S.Content>
      </S.ContentWrap>
    );
  }

  return (
    <S.Wrap>
      <S.Header>
        <NavBar isModal scrollTop={scrollTop} />
      </S.Header>
      {renderContent()}
    </S.Wrap>
  );
};
