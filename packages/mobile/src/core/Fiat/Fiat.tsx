import React, { FC, useCallback } from 'react';
import Animated from 'react-native-reanimated';

import { Button, Icon, ScrollHandler } from '$uikit';
import { useTheme } from '$hooks/useTheme';
import * as S from './Fiat.style';
import { openBuyFiat } from '$navigation';
import { CryptoCurrencies } from '$shared/constants';

export const Fiat: FC = () => {
  const theme = useTheme();

  const handleBuy = useCallback(() => {
    openBuyFiat(CryptoCurrencies.Ton, 'test');
  }, []);

  return (
    <>
      <ScrollHandler navBarTitle="Fiat">
        <Animated.ScrollView
          contentContainerStyle={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          alwaysBounceHorizontal={false}
          bounces={false}
        >
          <Icon name="ic-swap-28" color="accentPrimary" />
          <S.ButtonWrap>
            <Button size="small" onPress={handleBuy}>
              Buy
            </Button>
          </S.ButtonWrap>
        </Animated.ScrollView>
      </ScrollHandler>
    </>
  );
};
