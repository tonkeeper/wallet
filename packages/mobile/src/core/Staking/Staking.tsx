import { useStakingRefreshControl, useTranslator } from '$hooks';
import { useNavigation } from '$libs/navigation';
import { MainStackRouteNames } from '$navigation';
import { StakingListCell } from '$shared/components';
import { useStakingStore } from '$store';
import { List, ScrollHandler } from '$uikit';
import { getImplementationIcon } from '$utils';
import React, { FC, useCallback } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shallow } from 'zustand/shallow';
import * as S from './Staking.style';

interface Props {}

export const Staking: FC<Props> = () => {
  const t = useTranslator();

  const nav = useNavigation();

  const { bottom: bottomInset } = useSafeAreaInsets();

  const providers = useStakingStore((s) => s.providers, shallow);

  const refreshControl = useStakingRefreshControl();

  const handleProviderPress = useCallback(
    (providerId: string) => {
      nav.push(MainStackRouteNames.StakingPools, { providerId });
    },
    [nav],
  );

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={t('staking.title')}>
        <Animated.ScrollView
          refreshControl={<RefreshControl {...refreshControl} />}
          showsVerticalScrollIndicator={false}
        >
          <S.Content bottomInset={bottomInset}>
            <List separator={false}>
              {providers.map((provider, index) => (
                <StakingListCell
                  key={provider.id}
                  id={provider.id}
                  name={provider.name}
                  iconSource={getImplementationIcon(provider.id)}
                  description={provider.description}
                  separator={index < providers.length - 1}
                  onPress={handleProviderPress}
                />
              ))}
            </List>
          </S.Content>
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
