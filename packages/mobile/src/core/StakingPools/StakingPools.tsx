import { useTranslator } from '$hooks';
import { useNavigation } from '$libs/navigation';
import { MainStackRouteNames } from '$navigation';
import { MainStackParamList } from '$navigation/MainStack';
import { StakingListCell } from '$shared/components';
import { Icon, List, ScrollHandler, Spacer, Text } from '$uikit';
import { RouteProp } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import Animated from 'react-native-reanimated';
import * as S from './StakingPools.style';

interface Props {
  route: RouteProp<MainStackParamList, MainStackRouteNames.StakingPools>;
}

export const StakingPools: FC<Props> = () => {
  const t = useTranslator();

  const nav = useNavigation();

  const providerName = 'TON Whales';

  const handleWarningPress = useCallback(() => {}, []);

  const handlePoolPress = useCallback(
    (poolAddress: string) => {
      nav.push(MainStackRouteNames.StakingPoolDetails, { poolAddress });
    },
    [nav],
  );

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={providerName}>
        <Animated.ScrollView>
          <S.Content>
            <S.WarningContainer>
              <S.WarningTouchable
                background="backgroundQuaternary"
                onPress={handleWarningPress}
              >
                <S.WarningContent>
                  <Text variant="label1">{t('staking.warning.title')}</Text>
                  <Spacer y={2} />
                  <Text variant="body2" color="foregroundSecondary">
                    {t('staking.warning.desc')}
                  </Text>
                  <Spacer y={4} />
                  <S.WarningRow>
                    <Text variant="label1">
                      {t('staking.warning.about', { name: providerName })}
                    </Text>
                    <Spacer x={2} />
                    <S.WarningIcon>
                      <Icon name="ic-chevron-right-12" color="foregroundPrimary" />
                    </S.WarningIcon>
                  </S.WarningRow>
                </S.WarningContent>
              </S.WarningTouchable>
            </S.WarningContainer>
            <Spacer y={16} />
            <List separator={false}>
              <StakingListCell
                id="poolAddress"
                name="Tonkeeper #1"
                description={t('staking.staking_pool_desc', {
                  feePercentage: 30,
                  apy: 4.47,
                })}
                separator={true}
                onPress={handlePoolPress}
              />
              <StakingListCell
                id="poolAddress2"
                name="Tonkeeper #2"
                description={t('staking.staking_pool_desc', {
                  feePercentage: 30,
                  apy: 4.47,
                })}
                onPress={handlePoolPress}
              />
            </List>
          </S.Content>
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
