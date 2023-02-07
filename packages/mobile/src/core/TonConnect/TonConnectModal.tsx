import React from 'react';
import axios from 'axios';
import queryString from 'query-string';
import TonWeb from 'tonweb';
import { useDispatch, useSelector } from 'react-redux';
import { Linking, StyleSheet } from 'react-native';
import { useTheme } from '$hooks';
import { SelectableVersionsConfig } from '$shared/constants';
import { walletSelector } from '$store/wallet';
import { Button, Icon, Loader, Text, TransitionOpacity } from '$uikit';
import {
  debugLog,
  delay,
  getDomainFromURL,
  maskifyTonAddress,
  triggerNotificationSuccess,
} from '$utils';
import { toastActions } from '$store/toast';
import { UnlockVaultError } from '$store/wallet/sagas';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import {
  ADDRESS_REPEAT_COUNT,
  ADDRESS_TEXT_WIDTH,
  States,
  useTonConnectAnimation,
} from './useTonConnectAnimation';
import * as S from './TonConnect.style';
import { t } from '$translation';
import { TonConnectModalProps } from './models';
import { useEffect } from 'react';
import { Modal, useNavigation } from '$libs/navigation';
import { store } from '$store';
import { openRequireWalletModal, push } from '$navigation';
import { SheetActions } from '$libs/navigation/components/Modal/Sheet/SheetsProvider';
import { mainSelector } from '$store/main';

export const TonConnectModal = (props: TonConnectModalProps) => {
  const animation = useTonConnectAnimation();
  const unlockVault = useUnlockVault();
  const dispatch = useDispatch();
  const theme = useTheme();
  const nav = useNavigation();

  const { version } = useSelector(walletSelector);
  const { isTestnet } = useSelector(mainSelector);
  const maskedAddress = maskifyTonAddress(animation.address);

  const closeModal = () => nav.goBack();

  const isTonapi = props.protocolVersion === 1 ? props?.hostname === 'tonapi.io' : false;

  let appIconUri: string;
  let appName: string;
  if (props.protocolVersion === 1) {
    appIconUri = props.request.image_url;
    if (isTonapi && props.request.app_name) {
      appName = props.request.app_name;
    } else {
      appName = props.hostname;
    }
  } else {
    appIconUri = props.manifest.iconUrl;
    appName = props.manifest.name;
  }

  const domain =
    props.protocolVersion === 1 ? appName : getDomainFromURL(props.manifest.url);

  const isTonConnectV2 = props.protocolVersion !== 1;

  const sendToCallbackUrl = React.useCallback(
    async (response: string) => {
      if (props.protocolVersion !== 1) {
        return;
      }

      const { request } = props;

      if (request.callback_url) {
        const callbackUrl = createCallbackLink({
          toHash: request.return_serverless,
          url: request.callback_url,
          response,
        });

        const resp = await axios.get(callbackUrl);
        if (resp.status !== 200) {
          throw new Error('Failed to send response');
        }
      }
    },
    [props],
  );

  const createResponse = React.useCallback(async () => {
    try {
      animation.startLoading();

      const vault = await unlockVault();

      const address = await vault.getTonAddress(isTestnet);
      const privateKey = await vault.getTonPrivateKey();
      const walletSeed = TonWeb.utils.bytesToBase64(privateKey);

      if (props.protocolVersion === 1) {
        const { tonconnect, request, hostname } = props;

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
                clientId,
              });

              return {
                wallet_version: walletVersion,
                wallet_id: walletId,
                signature,
                address,
                pubkey,
              };
            },
          },
        });

        if (request.callback_url) {
          await sendToCallbackUrl(response);
        }
      }

      const withDelay = props.protocolVersion === 1 || !props.hideImmediately;

      await animation.showSuccess(() => {
        triggerNotificationSuccess();
      }, withDelay);

      if (props.protocolVersion !== 1) {
        const { stateInit } = await vault.tonWallet.createStateInit();
        const walletStateInit = TonWeb.utils.bytesToBase64(await stateInit.toBoc(false));

        const { replyBuilder, requestPromise } = props;

        const replyItems = replyBuilder.createReplyItems(
          address,
          privateKey,
          walletStateInit,
        );

        requestPromise.resolve({ address, replyItems });
      }

      if (props.protocolVersion === 1 && props.request.return_url) {
        animation.showReturnButton();
        return;
      }

      closeModal();
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
  }, [animation, dispatch, props, sendToCallbackUrl, unlockVault]);

  const handleBackToService = React.useCallback(async () => {
    if (props.protocolVersion !== 1) {
      return;
    }

    const { tonconnect, request, openUrl } = props;

    const response = tonconnect.getResponse();
    if (request.return_url && response) {
      const returnUrl = createCallbackLink({
        toHash: request.return_serverless,
        url: request.return_url,
        response,
      });
      const url = returnUrl.startsWith('http') ? returnUrl : `https://${returnUrl}`;

      if (openUrl) {
        openUrl(url);
        closeModal();
        return;
      }

      try {
        await Linking.openURL(url);

        await delay(2000);
        closeModal();
      } catch (err) {
        debugLog(err);
      }
    }
  }, [props]);

  useEffect(
    () => () => {
      if (props.protocolVersion !== 1) {
        props.requestPromise.reject();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <S.Container>
          <S.Logos>
            <S.Logo>
              <S.TonLogo>
                <Icon name="ic-logo-48" color="accentPrimary" />
              </S.TonLogo>
            </S.Logo>
            <S.AddressConatiner>
              <S.AddressLeftGradient
                colors={[theme.colors.backgroundPrimary, 'rgba(16, 22, 31, 0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <S.Address>
                <S.AddressText
                  style={[animation.ticker.textStyle, { width: ADDRESS_TEXT_WIDTH }]}
                >
                  {animation.address.repeat(ADDRESS_REPEAT_COUNT)}
                </S.AddressText>
              </S.Address>
              <S.VerticalDivider />
              <S.Address>
                <S.AddressText
                  style={[
                    animation.ticker.textStyle,
                    { paddingTop: 3, width: ADDRESS_TEXT_WIDTH },
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
              {appIconUri ? <S.Picture source={{ uri: appIconUri }} /> : null}
            </S.Logo>
          </S.Logos>

          <S.Content>
            <S.TitleWrapper>
              <Text variant="h2" textAlign="center">
                {t('ton_login_title', { name: appName })}
              </Text>
            </S.TitleWrapper>
            <Text color="foregroundSecondary" variant="body1" textAlign="center">
              {t('ton_login_caption', { name: domain })}
              <Text color="foregroundTertiary" variant="body1" textAlign="center">
                {' '}
                {maskedAddress}{' '}
              </Text>
              {SelectableVersionsConfig[version]
                ? SelectableVersionsConfig[version].label
                : null}
            </Text>
          </S.Content>
          <S.Footer isTonConnectV2={isTonConnectV2}>
            <TransitionOpacity
              style={styles.actionContainer}
              isVisible={animation.state === States.INITIAL}
              entranceAnimation={false}
            >
              <Button onPress={createResponse}>{t('ton_login_connect_button')}</Button>
              {isTonConnectV2 ? (
                <S.NoticeText>{t('ton_login_notice')}</S.NoticeText>
              ) : null}
            </TransitionOpacity>

            <TransitionOpacity
              style={styles.actionContainer}
              isVisible={animation.state === States.LOADING}
            >
              <S.Center isTonConnectV2={isTonConnectV2}>
                <Loader size="medium" />
              </S.Center>
            </TransitionOpacity>

            <TransitionOpacity
              style={styles.actionContainer}
              isVisible={animation.state === States.RETURN}
            >
              <Button onPress={handleBackToService} mode="secondary">
                {t('ton_login_back_to_button', { name: appName })}
              </Button>
            </TransitionOpacity>

            <TransitionOpacity
              style={styles.actionContainer}
              isVisible={animation.state === States.SUCCESS}
            >
              <S.Center isTonConnectV2={isTonConnectV2}>
                <Icon name="ic-checkmark-circle-32" color="accentPositive" />
                <S.SuccessText>{t('ton_login_success')}</S.SuccessText>
              </S.Center>
            </TransitionOpacity>
          </S.Footer>
        </S.Container>
      </Modal.Content>
    </Modal>
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
    url: options.url,
  });
}

export function openTonConnect(props: TonConnectModalProps) {
  if (store.getState().wallet.wallet) {
    push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: TonConnectModal,
      params: props,
      path: 'TonConnect',
    });
  } else {
    openRequireWalletModal();
  }
}
