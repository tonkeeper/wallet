import React, { FC, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import LottieView from 'lottie-react-native';

import * as S from './RequireWallet.style';
import { BottomSheet, Button, Text } from '$uikit';
import { useTranslator } from '$hooks';
import { ns } from '$utils';
import { openCreateWallet, openImportWallet } from '$navigation';
import { walletActions } from '$store/wallet';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';

export const RequireWallet: FC = () => {
  const t = useTranslator();
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
    <BottomSheet ref={bottomSheetRef} skipHeader>
      <S.Wrap>
        <S.LottieIcon
          ref={iconRef}
          source={require('$assets/lottie/logo.json')}
          loop={false}
          autoPlay={false}
          autoSize={false}
        />
        <S.TitleWrapper>
          <Text variant="h2" textAlign="center">
            {t('require_create_wallet_modal_title')}
          </Text>
        </S.TitleWrapper>
        <S.CaptionWrapper>
          <Text color="foregroundSecondary" variant="body1" textAlign="center">
            {t('require_create_wallet_modal_caption')}
          </Text>
        </S.CaptionWrapper>
      </S.Wrap>
      <S.Buttons>
        <Button onPress={handleCreate}>
          {t('require_create_wallet_modal_create_new')}
        </Button>
        <Button mode="secondary" style={{ marginTop: ns(16) }} onPress={handleRestore}>
          {t('require_create_wallet_modal_import')}
        </Button>
      </S.Buttons>
    </BottomSheet>
  );
};
