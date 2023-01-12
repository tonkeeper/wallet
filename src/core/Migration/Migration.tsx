import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import * as S from './Migration.style';
import { Button, Icon, Text } from '$uikit';
import { deviceWidth, ns, toLocaleNumber, triggerNotificationSuccess } from '$utils';
import { Card } from '$core/Migration/Card/Card';
import { goBack } from '$navigation';
import { MigrationProps } from './Migration.interface';
import { walletActions } from '$store/wallet';
import { CryptoCurrencies } from '$shared/constants';
import { useFiatRate, useTheme, useTranslator } from '$hooks';
import { formatFiatCurrencyAmount } from '$utils/currency';
import { mainSelector } from '$store/main';

export const Migration: FC<MigrationProps> = ({ route }) => {
  const {
    oldAddress,
    newAddress,
    migrationInProgress,
    oldBalance,
    newBalance,
    isTransfer,
    fromVersion
  } = route.params;

  const dispatch = useDispatch();
  const theme = useTheme();
  const t = useTranslator();
  const [step, setStep] = useState(migrationInProgress ? 1 : 0);
  const [cardsScale, setCardsScale] = useState(1);
  const { fiatCurrency } = useSelector(mainSelector);

  const iconAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(migrationInProgress ? 1 : 0);
  const feeInFiat = useFiatRate(CryptoCurrencies.Ton);

  useEffect(() => {
    if (migrationInProgress) {
      dispatch(
        walletActions.waitMigration({
          onDone: () => setStep(2),
          onFail: () => setStep(0),
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    slideAnimation.value = withTiming(step, {
      duration: 350,
      easing: Easing.inOut(Easing.ease),
    });

    if (step === 1) {
      iconAnimation.value = withRepeat(
        withDelay(
          600,
          withTiming(1, {
            duration: 1400,
          }),
        ),
        Infinity,
        false,
      );
    } else {
      cancelAnimation(iconAnimation);
      iconAnimation.value = 0;
    }

    let successTimer: any;
    if (step === 2) {
      triggerNotificationSuccess();
      successTimer = setTimeout(() => {
        goBack();
      }, 3000);
    }

    return () => clearTimeout(successTimer);
  }, [step]);

  const handleUpgrade = useCallback(() => {
    setStep(1);
    dispatch(
      walletActions.migrate({
        fromVersion,
        oldAddress,
        newAddress,
        onDone: () => setStep(2),
        onFail: () => setStep(0),
      }),
    );
  }, [dispatch, newAddress, oldAddress]);

  const handleSkip = useCallback(() => {
    goBack();
  }, []);

  // Scale cards for small devices
  const handleCardsLayout = useCallback(({ nativeEvent }) => {
    const height = nativeEvent.layout.height;
    const minHeight = ns(192);

    const scaleFactor = Math.min(height / minHeight, 1);
    setCardsScale(scaleFactor);
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(iconAnimation.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  const step1Style = useAnimatedStyle(() => ({
    opacity: interpolate(Math.min(slideAnimation.value, 1), [0, 1], [1, 0]),
    transform: [
      {
        translateX: interpolate(
          Math.min(slideAnimation.value, 1),
          [0, 1],
          [0, -deviceWidth],
        ),
      },
    ],
  }));

  const step2Style = useAnimatedStyle(() => ({
    opacity: interpolate(Math.min(slideAnimation.value, 2), [0, 1, 2], [0, 1, 0]),
    transform: [
      {
        translateX: interpolate(
          Math.min(slideAnimation.value, 2),
          [0, 1, 2],
          [deviceWidth, 0, -deviceWidth],
        ),
      },
    ],
  }));

  const step3Style = useAnimatedStyle(() => {
    const value = Math.min(Math.max(1, slideAnimation.value), 2);
    return {
      opacity: interpolate(value, [1, 2], [0, 1]),
      transform: [
        {
          translateX: interpolate(value, [1, 2], [deviceWidth, 0]),
        },
      ],
    };
  });

  return (
    <>
      <S.Step style={step1Style}>
        <S.Wrap>
          <S.Header>
            <Text variant="h2" textAlign="center">
              {t(isTransfer ? 'transfer_from_old_wallet_title' : 'migration_title')}
            </Text>
            <S.CaptionWrapper>
              <Text color="foregroundSecondary" variant="body1" textAlign="center">
                {t(isTransfer ? 'transfer_from_old_wallet_caption' : 'migration_caption')}
              </Text>
            </S.CaptionWrapper>
          </S.Header>
          <S.CardsWrap onLayout={handleCardsLayout}>
            <S.Cards
              style={{
                transform: [{ scale: cardsScale }],
              }}
            >
              <Card
                mode="old"
                address={oldAddress}
                amount={oldBalance}
                startValue={oldBalance}
              />
              <Card
                mode="new"
                address={newAddress}
                startValue={newBalance}
                amount={oldBalance}
              />
            </S.Cards>
          </S.CardsWrap>
          <Text color="foregroundSecondary" variant="body2" textAlign="center">
            {t('migration_fee_info', {
              tonFee: toLocaleNumber('0.01'),
              fiatFee: `${formatFiatCurrencyAmount(
                (feeInFiat.today * 0.01).toFixed(2),
                fiatCurrency,
              )}`,
            })}
          </Text>
          <S.Footer>
            <Button onPress={handleUpgrade}>
              {t(isTransfer ? 'transfer_from_old_wallet_btn' : 'migration_migrate_btn')}
            </Button>
            <Button
              mode="secondary"
              onPress={handleSkip}
              style={{
                marginTop: ns(16),
              }}
            >
              {t(isTransfer ? 'cancel' : 'migration_cancel_btn')}
            </Button>
          </S.Footer>
        </S.Wrap>
      </S.Step>
      <S.Step style={step2Style}>
        <S.StateWrap>
          <S.StateIcon style={iconStyle}>
            <Icon
              name="ic-settings-84"
              color="accentPrimary"
            />
          </S.StateIcon>
          <S.StateTitleWrapper>
            <Text variant="h2" textAlign="center">
              {t(
                isTransfer
                  ? 'transfer_from_old_wallet_in_progress'
                  : 'migration_in_progress',
              )}
            </Text>
          </S.StateTitleWrapper>
        </S.StateWrap>
      </S.Step>
      <S.Step style={step3Style}>
        <S.StateWrap>
          <S.StateIcon>
            <Icon name="ic-done-84" color="accentPositive" />
          </S.StateIcon>
        </S.StateWrap>
      </S.Step>
    </>
  );
};
