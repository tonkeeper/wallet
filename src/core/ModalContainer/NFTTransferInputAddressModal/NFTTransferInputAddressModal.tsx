import React, { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { useValidateAddress } from '$hooks';
import { Button, Icon, Input, Loader, Text } from '$uikit';
import * as S from './NFTTransferInputAddressModal.style';
import { t } from '$translation';
import { asyncDebounce, compareAddresses, isAndroid, isValidAddress, ns, parseTonLink } from '$utils';
import { NFTTransferInputAddressModalProps } from '$core/ModalContainer/NFTTransferInputAddressModal/NFTTransferInputAddressModal.interface';
import { LoaderContainer } from '$core/Send/steps/AddressStep/components/AddressInput/AddressInput.style';
import { Modal, useNavigation } from '$libs/navigation';
import { Tonapi } from '$libs/Tonapi';
import TonWeb from 'tonweb';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { openScanQR } from '$navigation';
import { Toast } from '$store';

export const NFTTransferInputAddressModal = memo<NFTTransferInputAddressModalProps>(
  ({ nftAddress }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [address, setAddress] = useState('');
    const [isSameAddress, setIsSameAddress] = useState<boolean>(false);
    const { isValid } = useValidateAddress(address);
    const [dnsLoading, setDnsLoading] = React.useState(false);

    const nav = useNavigation();

    // Don't allow user to paste NFT address
    useLayoutEffect(() => {
      if (compareAddresses(nftAddress, address)) {
        setIsSameAddress(true);
      } else if (isSameAddress) {
        setIsSameAddress(false);
      }
    }, [address, isSameAddress, nftAddress]);

    const handleContinue = useCallback(() => {
      nav.replaceModal('NFTTransfer', {
        response_options: {
          onDone: () => setTimeout(nav.globalGoBack, 850),
        } as any,
        params: {
          newOwnerAddress: address,
          nftItemAddress: nftAddress,
          amount: '50000000',
          forwardAmount: '20000000',
        },
      });
    }, [address, nftAddress]);

    // todo: move logic to separated hook
    const getAddressByDomain = useMemo(
      () =>
        asyncDebounce(async (value: string) => {
          try {
            setDnsLoading(true);
            const domain = value.toLowerCase();
            const resolvedDomain = await Tonapi.resolveDns(domain);

            if (resolvedDomain?.wallet?.address) {
              return new TonWeb.Address(resolvedDomain.wallet.address).toString(
                true,
                true,
                true,
              ) as string;
            }

            return null;
          } catch (e) {
            console.log('err', e);

            return null;
          } finally {
            setDnsLoading(false);
          }
        }, 1000),
      [],
    );

    const handleTextChange = React.useCallback(async (text: string) => {
      setInputValue(text);
      if (!TonWeb.Address.isValid(text) && text.includes('.')) {
        setAddress('');
        const walletAddress = await getAddressByDomain(text);

        if (walletAddress) {
          setAddress(walletAddress);
          return;
        }
      }

      setAddress(text);
    }, []);

    const canScanQR = inputValue.length === 0;

    const handleScanQR = useCallback(() => {
      openScanQR(async (code: string) => {
        const link = parseTonLink(code);
        const isTransferOperation = link.match && link.operation === 'transfer';
  
        if (isTransferOperation && !isValidAddress(link.address)) {
          Toast.fail(t('transfer_deeplink_address_error'));
          return false;
        } else if (isTransferOperation && isValidAddress(link.address)) {
          handleTextChange(link.address);
          return true;
        } else if (isValidAddress(code)) {
          handleTextChange(code);
          return true;
        }
        return false;
      });
    }, [t, handleTextChange]);

    const scanQRContainerStyle = useAnimatedStyle(
      () => ({
        opacity: withTiming(canScanQR ? 1 : 0, { duration: 150 }),
        zIndex: canScanQR ? 1 : -1,
      }),
      [canScanQR],
    );

    return (
      <Modal android_keyboardInputMode="adjustResize">
        <Modal.Header title={t('nft_transfer_nft')} />
        <Modal.Content style={{ paddingBottom: ns(16) }}>
          <S.Wrap>
            <Text
              style={{ marginBottom: ns(24) }}
              variant="body1"
              color="foregroundSecondary"
            >
              {t('nft_transfer_description')}
            </Text>
            <S.InputWrapper>
              <Input
                placeholder={t('send_address_placeholder')}
                isFailed={!!address.length && !isValid}
                onChangeText={handleTextChange}
                component={Modal.Input}
                onBlur={() => {
                  if (!isAndroid) {
                    nav.goBack();
                  }
                }}
                value={inputValue}
                autoFocus
              />
              {dnsLoading && (
                <LoaderContainer>
                  <Loader size="medium" />
                </LoaderContainer>
              )}
              <S.ScanQRContainer style={scanQRContainerStyle}>
                <S.ScanQRTouchable disabled={!canScanQR} onPress={handleScanQR}>
                  <Icon name="ic-viewfinder-28" color="accentPrimary" />
                </S.ScanQRTouchable>
              </S.ScanQRContainer>
            </S.InputWrapper>
          </S.Wrap>
          <S.Buttons>
            <Button
              disabled={!address?.length || !isValid || isSameAddress}
              onPress={handleContinue}
            >
              {t('continue')}
            </Button>
          </S.Buttons>
        </Modal.Content>
      </Modal>
    );
  },
);
