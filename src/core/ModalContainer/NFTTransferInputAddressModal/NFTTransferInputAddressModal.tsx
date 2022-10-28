import React, { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { useValidateAddress } from '$hooks';
import { Button, Input, Loader, Text } from '$uikit';
import * as S from './NFTTransferInputAddressModal.style';
import { t } from '$translation';
import { asyncDebounce, compareAddresses, isAndroid, ns } from '$utils';
import { NFTTransferInputAddressModalProps } from '$core/ModalContainer/NFTTransferInputAddressModal/NFTTransferInputAddressModal.interface';
import { getServerConfig } from '$shared/constants';
import { LoaderContainer } from '$core/Send/steps/AddressStep/components/AddressInput/AddressInput.style';
import { Modal, useNavigation } from '$libs/navigation';

const TonWeb = require('tonweb'); // fix dns types

export const NFTTransferInputAddressModal = memo<NFTTransferInputAddressModalProps>(
  ({ nftAddress }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [address, setAddress] = useState('');
    const [isSameAddress, setIsSameAddress] = useState<boolean>(false);
    const { isValid } = useValidateAddress(address);
    const [dnsLoading, setDnsLoading] = React.useState(false);

    console.log('@LOG');

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

    const getAddressByDomain = useMemo(
      () =>
        asyncDebounce(async (value: string) => {
          try {
            setDnsLoading(true);
            const domain = value.toLowerCase();
            const tonweb = new TonWeb(
              new TonWeb.HttpProvider(getServerConfig('tonEndpoint'), {
                apiKey: getServerConfig('tonEndpointAPIKey'),
              }),
            );

            const response = await tonweb.dns.getWalletAddress(domain);
            if (response) {
              return response.toString(true, true, true) as string;
            }

            return null;
          } catch (e) {
            console.log('err', e);

            return null;
          } finally {
            setDnsLoading(false);
          }
        }, 300),
      [],
    );

    const handleTextChange = React.useCallback(async (text: string) => {
      setInputValue(text);
      if (text.endsWith('.ton')) {
        setAddress('');
        const walletAddress = await getAddressByDomain(text);

        if (walletAddress) {
          setAddress(walletAddress);
          return;
        }
      }

      setAddress(text);
    }, []);

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
