import React, { useCallback, useMemo, useRef } from 'react';
import LottieView from 'lottie-react-native';

import { Text } from '$uikit';
import * as S from './DeleteAccountDone.style';
import { t } from '@tonkeeper/shared/i18n';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { Steezy, View } from '@tonkeeper/uikit';

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
    dispatch(walletActions.cleanWallet({ cleanAll: false }));
  }, [dispatch]);

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = Steezy.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: -16,
  },
});
