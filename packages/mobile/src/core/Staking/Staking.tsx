import { useStakingRefreshControl, useTranslator } from '$hooks';
import { useNavigation } from '$libs/navigation';
import { MainStackRouteNames } from '$navigation';
import { StakingListCell } from '$shared/components';
import { useStakingStore } from '$store';
import { ScrollHandler } from '$uikit';
import { List } from '$uikit/List/old/List';
import { getImplementationIcon } from '$utils';
import { formatter } from '$utils/formatter';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useMemo } from 'react';
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

  const list = useMemo(() => {
    return providers.map((item) => {
      const bn = new BigNumber(formatter.fromNano(item.minStake));
      const minStake = bn.isLessThan('1000')
        ? formatter.format(bn.toFixed(0), { decimals: 0 })
        : `${bn.dividedBy('1000').toFixed(0)}K`;

      return {
        ...item,
        description: t('staking.staking_desc', {
          maxApy: item.maxApy.toFixed(2),
          minStake: minStake,
        }),
      };
    });
  }, [providers, t]);

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
              {list.map((provider, index) => (
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
