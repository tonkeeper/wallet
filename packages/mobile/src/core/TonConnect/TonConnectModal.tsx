import React, { useCallback, useMemo } from 'react';
import axios from 'axios';
import { StyleSheet } from 'react-native';
import { useTheme } from '$hooks/useTheme';
import { Button, List, Loader, Spacer, Text, TransitionOpacity } from '$uikit';
import {
  convertHexToRGBA,
  getDomainFromURL,
  triggerNotificationSuccess,
  triggerSelection,
} from '$utils';
import { debugLog } from '$utils/debugLog';
import { UnlockVaultError } from '$store/wallet/sagas';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import {
  ADDRESS_REPEAT_COUNT,
  ADDRESS_TEXT_WIDTH,
  States,
  useTonConnectAnimation,
} from './useTonConnectAnimation';
import * as S from './TonConnect.style';
import { t } from '@tonkeeper/shared/i18n';
import { TonConnectModalProps } from './models';
import { useEffect } from 'react';
import { Haptics, Icon, Modal } from '@tonkeeper/uikit';
import { Toast } from '$store';
import { push } from '$navigation/imperative';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { Address, ContractService } from '@tonkeeper/core';
import { replaceString } from '@tonkeeper/shared/utils/replaceString';
import { tk } from '$wallet';
import { WalletListItem } from '@tonkeeper/shared/components';
import { useWallets } from '@tonkeeper/shared/hooks';

export const TonConnectModal = (props: TonConnectModalProps) => {
  const { isInternalBrowser, replyBuilder, requestPromise, manifest } = props;

  const animation = useTonConnectAnimation();
  const unlockVault = useUnlockVault();
  const theme = useTheme();
  const nav = useNavigation();
  const [selectedWalletIdentifier, setSelectedWalletIdentifier] = React.useState<string>(
    tk.wallet.isWatchOnly || tk.wallet.isExternal
      ? tk.walletForUnlock.identifier
      : tk.wallet.identifier,
  );
  const allWallets = useWallets();
  const selectableWallets = useMemo(
    () => allWallets.filter((wallet) => !wallet.isWatchOnly && !wallet.isExternal),
    [allWallets],
  );
  const wallet = useMemo(
    () => tk.wallets.get(selectedWalletIdentifier)!,
    [selectedWalletIdentifier],
  );
  const showNotifications = wallet.notifications.isAvailable;
  const [withNotifications, setWithNotifications] = React.useState(showNotifications);
  const friendlyAddress = wallet.address.ton.friendly;
  const maskedAddress = Address.toShort(friendlyAddress);

  const showWalletSelector = selectableWallets.length > 1 && !isInternalBrowser;

  const handleSwitchNotifications = useCallback(() => {
    triggerSelection();
    setWithNotifications((prev) => !prev);
  }, []);

  const closeModal = useCallback(() => nav.goBack(), [nav]);

  const appIconUri = manifest.iconUrl;
  const appName = manifest.name;

  const domain = getDomainFromURL(manifest.url);

  const createResponse = React.useCallback(async () => {
    try {
      animation.startLoading();

      const vault = await unlockVault(wallet.identifier);
      const privateKey = await vault.getTonPrivateKey();
      const publicKey = Buffer.from(wallet.pubkey, 'hex');

      const address = wallet.address.ton.friendly;

      await animation.showSuccess(() => {
        triggerNotificationSuccess();
      }, !isInternalBrowser);

      const stateInit = ContractService.getStateInit(wallet.contract);

      const replyItems = await replyBuilder.createReplyItems(
        address,
        privateKey,
        publicKey,
        stateInit,
        wallet.isTestnet,
      );

      if (withNotifications && !wallet.tonProof.tonProofToken) {
        await wallet.tonProof.obtainProof(await vault.getKeyPair());
      }

      requestPromise.resolve({
        address,
        replyItems,
        notificationsEnabled: withNotifications,
        walletIdentifier: wallet.identifier,
      });

      closeModal();
    } catch (error) {
      animation.revert();
      let message = error?.message;
      if (axios.isAxiosError(error)) {
        return Toast.fail(t('error_network'));
      } else if (error instanceof UnlockVaultError) {
        return;
      }

      debugLog('[TonLogin]:', error);
      Toast.fail(message);
    }
  }, [
    animation,
    closeModal,
    isInternalBrowser,
    replyBuilder,
    requestPromise,
    unlockVault,
    wallet,
    withNotifications,
  ]);

  const handleWalletPress = useCallback(() => {
    Haptics.selection();
    nav.openModal('/switch-wallet', {
      onSelect: setSelectedWalletIdentifier,
      selected: selectedWalletIdentifier,
    });
  }, [nav, selectedWalletIdentifier]);

  useEffect(
    () => () => {
      requestPromise.reject();
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
                <Icon name="ic-logo-48" colorHex="#45AEF5" />
              </S.TonLogo>
            </S.Logo>
            <S.AddressConatiner>
              <S.AddressLeftGradient
                colors={[
                  theme.colors.backgroundPrimary,
                  convertHexToRGBA(theme.colors.backgroundPrimary, 0),
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <S.Address>
                <S.AddressText
                  style={[animation.ticker.textStyle, { width: ADDRESS_TEXT_WIDTH }]}
                >
                  {friendlyAddress.repeat(ADDRESS_REPEAT_COUNT)}
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
                  {'* '.repeat(friendlyAddress.length * ADDRESS_REPEAT_COUNT)}
                </S.AddressText>
              </S.Address>
              <S.AddressRightGradient
                colors={[
                  theme.colors.backgroundPrimary,
                  convertHexToRGBA(theme.colors.backgroundPrimary, 0),
                ]}
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
                {replaceString(t('ton_login_title'), '%domain', () => (
                  <Text key={domain} variant="h2" color="accentBlue">
                    {domain}
                  </Text>
                ))}
              </Text>
            </S.TitleWrapper>
            <Text color="foregroundSecondary" variant="body1" textAlign="center">
              {t('ton_login_caption', { name: appName })}
              {!showWalletSelector ? (
                <>
                  <Text color="foregroundTertiary" variant="body1" textAlign="center">
                    {' '}
                    {maskedAddress}{' '}
                  </Text>
                  {tk.wallet.version}
                </>
              ) : (
                ':'
              )}
            </Text>
          </S.Content>
          {showWalletSelector ? (
            <List indent={false}>
              <WalletListItem
                onPress={handleWalletPress}
                wallet={wallet}
                subtitle={maskedAddress}
                rightContent={
                  <Icon
                    name="ic-switch-16"
                    style={styles.walletSelectorIcon}
                    color="iconSecondary"
                  />
                }
              />
            </List>
          ) : null}
          {showNotifications ? (
            <>
              <List indent={false}>
                <List.ItemWithCheckbox
                  title={t('notifications.allow_notifications')}
                  checked={withNotifications}
                  onChange={handleSwitchNotifications}
                />
              </List>
            </>
          ) : null}
          <Spacer y={16} />
          <S.Footer>
            <TransitionOpacity
              style={styles.actionContainer}
              isVisible={animation.state === States.INITIAL}
              entranceAnimation={false}
            >
              <Button onPress={createResponse}>{t('ton_login_connect_button')}</Button>
              <S.NoticeText>{t('ton_login_notice')}</S.NoticeText>
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
              isVisible={animation.state === States.SUCCESS}
            >
              <S.Center>
                <Icon name="ic-checkmark-circle-32" color="accentGreen" />
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
  walletSelectorIcon: {
    marginRight: 6,
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

export function openTonConnect(props: TonConnectModalProps) {
  if (tk.walletForUnlock) {
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
