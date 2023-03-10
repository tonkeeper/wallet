import { whalesIconSource } from '$assets/staking';
import { useTranslator } from '$hooks';
import { useNavigation } from '$libs/navigation';
import { MainStackRouteNames } from '$navigation';
import { StakingListCell } from '$shared/components';
import { List, ScrollHandler } from '$uikit';
import React, { FC, useCallback } from 'react';
import Animated from 'react-native-reanimated';
import * as S from './Staking.style';

interface Props {}

export const Staking: FC<Props> = () => {
  const t = useTranslator();

  const nav = useNavigation();

  const handleProviderPress = useCallback(
    (providerId: string) => {
      nav.push(MainStackRouteNames.StakingPools, { providerId });
    },
    [nav],
  );

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={'Staking'}>
        <Animated.ScrollView>
          <S.Content>
            <List separator={false}>
              <StakingListCell
                id="whales"
                name="TON Whales"
                iconSource={whalesIconSource}
                description={t('staking.staking_provider_desc', {
                  minDeposit: 50,
                  maxApy: 6.4,
                })}
                separator={true}
                onPress={handleProviderPress}
              />
              <StakingListCell
                id="nominator"
                name="TON Nominator Pools"
                iconSource={whalesIconSource}
                description={t('staking.staking_provider_desc', {
                  minDeposit: '10K',
                  maxApy: 6.2,
                })}
                onPress={handleProviderPress}
              />
            </List>
          </S.Content>
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
