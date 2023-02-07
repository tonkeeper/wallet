import React, { useCallback, useMemo, useRef } from 'react';
import LottieView from 'lottie-react-native';

import { Text } from '$uikit';
import * as CreateWalletStyle from '$core/CreateWallet/CreateWallet.style';
import { goBack, popToTop } from '$navigation';
import * as S from './DeleteAccountDone.style';
import { ns } from '$utils';
import { t } from '$translation';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';

export const DeleteAccountDone: React.FC = () => {
  const dispatch = useDispatch();
  const checkIconRef = useRef<LottieView>(null);

  useMemo(() => {
    const timer = setTimeout(() => {
      checkIconRef.current?.play();
      // triggerNotificationSuccess();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    dispatch(walletActions.cleanWallet());
  }, []);

  return (
    <CreateWalletStyle.Content style={{ marginTop: -ns(16) }}>
      <S.LottieIcon
        ref={checkIconRef}
        onAnimationFinish={handleAnimationEnd}
        source={require('$assets/lottie/check480.json')}
        loop={false}
        autoPlay={false}
        autoSize={false}
      />
      <S.TitleWrapper>
        <Text variant="h2" textAlign="center">
          {t('account_deleted')}
        </Text>
      </S.TitleWrapper>
    </CreateWalletStyle.Content>
  );
};
