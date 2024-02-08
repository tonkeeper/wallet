import React, { FC, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import LottieView from 'lottie-react-native';

import * as S from './RequireWallet.style';
import { Text, Button, Modal, View } from '@tonkeeper/uikit';

import { openImportWallet } from '$navigation/helper';
import { walletActions } from '$store/wallet';
import { SheetActions, navigation, useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { openCreateWallet } from '$core/CreateWallet/CreateWallet';
import { AddWalletModal } from '@tonkeeper/shared/modals/AddWalletModal';

export const RequireWallet: FC = () => {
  const iconRef = useRef<LottieView>(null);
  const nav = useNavigation();
  const dispatch = useDispatch();
  const destination = useRef<string | null>(null);

  useEffect(() => {
    dispatch(walletActions.clearGeneratedVault());

    const timer = setTimeout(() => {
      iconRef.current?.play();
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const handleClose = useCallback(() => {
    if (destination.current === 'Create') {
      openCreateWallet();
    } else if (destination.current === 'Import') {
      openImportWallet();
    }
  }, []);

  return (
    <Modal onClose={handleClose}>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={{ marginBottom: 16 }}>
          <S.Wrap>
            <S.LottieIcon
              ref={iconRef}
              source={require('$assets/lottie/logo.json')}
              loop={false}
              autoPlay={false}
              autoSize={false}
            />
            <S.TitleWrapper>
              <Text type="h2" textAlign="center">
                {t('require_create_wallet_modal_title')}
              </Text>
            </S.TitleWrapper>
            <S.CaptionWrapper>
              <Text color="textSecondary" type="body1" textAlign="center">
                {t('require_create_wallet_modal_caption')}
              </Text>
            </S.CaptionWrapper>
          </S.Wrap>
          <S.Buttons>
            <Button
              onPress={() => {
                destination.current = 'Create';
                nav.goBack();
              }}
              title={t('require_create_wallet_modal_create_new')}
            />
            <Button
              color="secondary"
              style={{ marginTop: 16 }}
              onPress={() => {
                destination.current = 'Import';
                nav.goBack();
              }}
              title={t('require_create_wallet_modal_import')}
            />
          </S.Buttons>
        </View>
      </Modal.Content>
    </Modal>
  );
};

export function openRequireWalletModal() {
  navigation.navigate('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: AddWalletModal,
    params: {},
    path: '/add-wallet',
  });
}
