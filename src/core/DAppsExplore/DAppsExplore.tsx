import { useTranslator } from '$hooks';
import { useDeeplinking } from '$libs/deeplinking';
import { openDAppsSearch, openRequireWalletModal, openScanQR } from '$navigation';
import { IsTablet, LargeNavBarHeight } from '$shared/constants';
import { store } from '$store';
import { Icon, ScrollHandler } from '$uikit';
import { hNs } from '$utils';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { FC, memo, useCallback } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { ConnectedApps, PopularApps, SearchButton } from './components';
import * as S from './DAppsExplore.style';

export interface DAppsExploreProps {}

const DAppsExploreComponent: FC<DAppsExploreProps> = (props) => {
  const {} = props;

  const t = useTranslator();
  const tabBarHeight = useBottomTabBarHeight();
  const deeplinking = useDeeplinking();

  const handlePressOpenScanQR = React.useCallback(() => {
    if (store.getState().wallet.wallet) {
      openScanQR((str) => {
        const resolver = deeplinking.getResolver(str, { delay: 200 });
        if (resolver) {
          resolver();
          return true;
        }

        return false;
      });
    } else {
      openRequireWalletModal();
    }
  }, [deeplinking]);

  const handleSearchPress = useCallback(() => {
    openDAppsSearch();
  }, []);

  return (
    <S.Wrap>
      <S.ScrollViewContainer>
        <ScrollHandler
          navBarTitle={t('browser.title')}
          navBarRight={
            <TouchableOpacity
              onPress={handlePressOpenScanQR}
              style={{ zIndex: 3 }}
              activeOpacity={0.6}
              hitSlop={{
                top: 26,
                bottom: 26,
                left: 26,
                right: 26,
              }}
            >
              <Icon name="ic-viewfinder-28" color="accentPrimary" />
            </TouchableOpacity>
          }
        >
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            // eslint-disable-next-line react-native/no-inline-styles
            contentContainerStyle={{
              paddingTop: hNs(LargeNavBarHeight),
              alignItems: IsTablet ? 'center' : undefined,
            }}
            scrollEventThrottle={16}
          >
            <S.Content>
              <ConnectedApps />
              <PopularApps />
            </S.Content>
          </Animated.ScrollView>
        </ScrollHandler>
      </S.ScrollViewContainer>
      <S.SearchBarContainer tabBarHeight={tabBarHeight}>
        <SearchButton onPress={handleSearchPress} />
      </S.SearchBarContainer>
    </S.Wrap>
  );
};

export const DAppsExplore = memo(DAppsExploreComponent);
