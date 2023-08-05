import React, { FC, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import LottieView from 'lottie-react-native';

import * as S from './RequireWallet.style';
import { Text, Button, Modal } from '@tonkeeper/uikit';

import { openImportWallet } from '$navigation/helper';
import { walletActions } from '$store/wallet';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';
import { SheetActions } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { openCreateWallet } from '$core/CreateWallet/CreateWallet';
import { push } from '$navigation/imperative';

export const RequireWallet: FC = () => {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const iconRef = useRef<LottieView>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(walletActions.clearGeneratedVault());

    const timer = setTimeout(() => {
      iconRef.current?.play();
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const handleCreate = useCallback(() => {
    bottomSheetRef.current?.close(() => {
      openCreateWallet();
    });
  }, []);

  const handleRestore = useCallback(() => {
    bottomSheetRef.current?.close(() => {
      openImportWallet();
    });
  }, []);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <S.Wrap style={{ marginBottom: 16 }}>
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
            onPress={handleCreate}
            title={t('require_create_wallet_modal_create_new')}
          />
          <Button
            color="secondary"
            style={{ marginTop: 16 }}
            onPress={handleRestore}
            title={t('require_create_wallet_modal_import')}
          />
        </S.Buttons>
      </Modal.Content>
    </Modal>
  );
};

export function openRequireWalletModal() {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: RequireWallet,
    params: {},
    path: 'RequireWallet',
  });
}
