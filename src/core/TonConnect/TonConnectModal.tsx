import React from 'react';
import axios from 'axios';
import queryString from 'query-string';
import TonWeb from 'tonweb';
import { useDispatch, useSelector } from 'react-redux';
import { Linking, StyleSheet } from 'react-native';
import { useTheme } from '$hooks';
import { SelectableVersionsConfig } from '$shared/constants';
import { walletSelector } from '$store/wallet';
import { BottomSheet, Button, Icon, Loader, Text, TransitionOpacity } from '$uikit';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';
import { debugLog, delay, maskifyTonAddress, triggerNotificationSuccess } from '$utils';
import { toastActions } from '$store/toast';
import { UnlockVaultError } from '$store/wallet/sagas';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { AuthRequestBody, TonLoginClient } from '@tonapps/tonlogin-client';
import { ADDRESS_REPEAT_COUNT, ADDRESS_TEXT_WIDTH, States, useTonConnectAnimation } from './useTonConnectAnimation';
import * as S from './TonConnect.style';
import { t } from '$translation';

export interface TonConnectModalProps {
  tonconnect: TonLoginClient;
  request: AuthRequestBody;
  hostname: string;
}

export const TonConnectModal = (props: TonConnectModalProps) => {
  const { hostname, request, tonconnect } = props;
  const animation = useTonConnectAnimation();
  const unlockVault = useUnlockVault();
  const dispatch = useDispatch();
  const theme = useTheme();

  const { version } = useSelector(walletSelector);
  const maskedAddress = maskifyTonAddress(animation.address);
 
  const bottomSheetRef = React.useRef<BottomSheetRef>(null);
  const closeBottomSheet = () => bottomSheetRef.current?.close();

  const sendToCallbackUrl = React.useCallback(async (response: string) => {
      if (request.callback_url) {
      const callbackUrl = createCallbackLink({ 
        toHash: request.return_serverless,
        url: request.callback_url,
        response
      });

      const resp = await axios.get(callbackUrl);
      if (resp.status !== 200) {
        throw new Error('Failed to send response');
      } 
    }
  }, []);

  const createResponse = React.useCallback(async () => {
    try {
      animation.startLoading();

      const vault = await unlockVault();

      const address = await vault.getTonAddress();
      const privateKey = await vault.getTonPrivateKey();
      const walletSeed = TonWeb.utils.bytesToBase64(privateKey);

      const response = await tonconnect.createResponse({
        service: hostname,
        seed: walletSeed,
        realm: 'web',
        payload: {
          tonAddress: () => ({ address }),
          tonOwnership: ({ clientId }) => {
            const pubkey = TonWeb.utils.bytesToBase64(vault.tonPublicKey);
            const walletVersion = vault.getVersion() ?? '';
            const walletId = vault.getWalletId();
            
            const signature = tonconnect.createTonOwnershipSignature({
              secretKey: privateKey,
              walletVersion,
              address,
              clientId
            });

            return {
              wallet_version: walletVersion,
              wallet_id: walletId,
              signature,
              address,
              pubkey,
            };
          }
        }
      });

      if (request.callback_url) {
        await sendToCallbackUrl(response);
      }
      
      await animation.showSuccess(() => {
        triggerNotificationSuccess();
      });

      if (request.return_url) {        
        animation.showReturnButton();
      } else {
        closeBottomSheet();
      }      
    } catch (error) {
      animation.revert();
      let message = error?.message;
      if (axios.isAxiosError(error)) {
        return dispatch(toastActions.fail(t('error_network')));
      } else if (error instanceof UnlockVaultError) {
        return;
      }

      debugLog('[TonLogin]:', error);
      dispatch(toastActions.fail(message));
    }
  }, []);

  const handleBackToService = React.useCallback(async () => {
    const response = tonconnect.getResponse();
    if (request.return_url && response) {
      const returnUrl = createCallbackLink({ 
        toHash: request.return_serverless,
        url: request.return_url,
        response
      });

      try { 
        await Linking.openURL(`https://${returnUrl}`);

        await delay(2000);
        closeBottomSheet();
      } catch (err) {
        debugLog(err);
      }
    }
  }, []);

  return (
    <BottomSheet skipHeader ref={bottomSheetRef}>
      <S.Container> 
        <S.Logos>
          <S.Logo>
            <S.TonLogo>
              <Icon
                name="ic-logo-48"
                color="accentPrimary"
              />
            </S.TonLogo>
          </S.Logo>
          <S.AddressConatiner>
            <S.AddressLeftGradient
              colors={[theme.colors.backgroundPrimary, 'rgba(16, 22, 31, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <S.Address>
              <S.AddressText style={[animation.ticker.textStyle, { width: ADDRESS_TEXT_WIDTH }]}>
                {animation.address.repeat(ADDRESS_REPEAT_COUNT)}
              </S.AddressText>
            </S.Address>
            <S.VerticalDivider />
            <S.Address>
              <S.AddressText 
                style={[
                  animation.ticker.textStyle, 
                  { paddingTop: 3, width: ADDRESS_TEXT_WIDTH }
                ]}
              >
                {'* '.repeat(animation.address.length * ADDRESS_REPEAT_COUNT)}
              </S.AddressText>
            </S.Address>
            <S.AddressRightGradient
              colors={[theme.colors.backgroundPrimary, 'rgba(16, 22, 31, 0)']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
            />
          </S.AddressConatiner>
          <S.Logo>
            <S.Picture source={{ uri: request.image_url }} />
          </S.Logo>
        </S.Logos>

        <S.Content>
          <S.TitleWrapper>
            <Text variant="h2" textAlign="center">
              {t('ton_login_title', { name: hostname })}
            </Text>
          </S.TitleWrapper>
          <Text color="foregroundSecondary" variant="body1" textAlign="center">
            {t('ton_login_caption', { name: hostname })}
            <Text color="foregroundTertiary" variant="body1" textAlign="center"> {maskedAddress} </Text>
            {SelectableVersionsConfig[version]
              ? SelectableVersionsConfig[version].label
              : null}
          </Text>
        </S.Content>
        <S.Footer>
          <TransitionOpacity
            style={styles.actionContainer}
            isVisible={animation.state === States.INITIAL}
            entranceAnimation={false}
          >
            <Button onPress={createResponse}>
              {t('ton_login_connect_button')}
            </Button>
          </TransitionOpacity>

          <TransitionOpacity
            style={styles.actionContainer}
            isVisible={animation.state === States.LOADING}
          >
            <S.Center>
              <Loader size="medium" />
            </S.Center>
          </TransitionOpacity>

          <TransitionOpacity
            style={styles.actionContainer}
            isVisible={animation.state === States.RETURN}
          >
            <Button onPress={handleBackToService} mode="secondary">
              {t('ton_login_back_to_button', { name: hostname })}
            </Button>
          </TransitionOpacity>

          <TransitionOpacity
            style={styles.actionContainer}
            isVisible={animation.state === States.SUCCESS}
          >
            <S.Center>
              <Icon 
                name="ic-checkmark-circle-32"
                color="accentPositive"
              />
              <S.SuccessText>{t('ton_login_success')}</S.SuccessText>
            </S.Center>
          </TransitionOpacity>
        </S.Footer>
      </S.Container>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});


type CreateAuthResponseLinkOptions = {
  url: string;
  response: string;
  toHash?: boolean;
};

function createCallbackLink(options: CreateAuthResponseLinkOptions) {
  return queryString.stringifyUrl({ 
    ...(options.toHash && { fragmentIdentifier: 'tonlogin' }),
    query: { tonlogin: options.response }, 
    url: options.url
  });
}