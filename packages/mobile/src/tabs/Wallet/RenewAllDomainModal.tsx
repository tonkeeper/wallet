import { useNavigation } from '@tonkeeper/router';
import { openNFT } from '$navigation/helper';
import { navigate } from '$navigation/imperative';
import { ExpiringDomainItem } from '$store/zustand/domains/types';
import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { t } from '$translation';
import { Button, NavBar, SText } from '$uikit';
import { ONE_YEAR_MILISEC, delay, format, getCountOfDays, getLocale, ns } from '$utils';
import { memo, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomButtonWrap, BottomButtonWrapHelper } from '$shared/components';
import { openСonfirmRenewAllDomains } from './components/СonfirmRenewAllDomains';
import { CryptoCurrencies } from '$shared/constants';
import { Address } from '@tonkeeper/shared/Address';
import { List } from '@tonkeeper/uikit';

export const RenewAllDomainModal = memo(() => {
  const safeArea = useSafeAreaInsets();
  const scrollTop = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const nav = useNavigation();
  const domains = useExpiringDomains((state) => state.items);

  const handleRenew = useCallback(async () => {
    await delay(1000);
    if (domains.length < 1) {
      nav.goBack();
    }
  }, [domains]);

  const handleRenewAll = useCallback(async () => {
    nav.goBack();
    await delay(350);
    openСonfirmRenewAllDomains();
  }, [domains]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollTop.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <NavBar
        hideBackButton
        isClosedButton
        isModal
        scrollTop={scrollTop}
        titleProps={{ numberOfLines: 1 }}
      >
        {t('expiring_domains')}
      </NavBar>
      <Animated.ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        ref={scrollRef}
        contentContainerStyle={{
          paddingHorizontal: ns(16),
          paddingBottom: safeArea.bottom,
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <List indent={false}>
          {domains.map((domain) => (
            <ExpiringListItem key={domain.name} domain={domain} onRenew={handleRenew} />
          ))}
        </List>
        <BottomButtonWrapHelper safeArea={false} />
      </Animated.ScrollView>
      <BottomButtonWrap>
        <Button onPress={handleRenewAll}>
          {t('dns_renew_all_until_btn', {
            untilDate: format(+new Date() + ONE_YEAR_MILISEC, 'dd MMM yyyy', {
              locale: getLocale(),
            }),
          })}
        </Button>
      </BottomButtonWrap>
    </View>
  );
});

const ExpiringListItem = memo(
  (props: { domain: ExpiringDomainItem; onRenew: () => void }) => {
    const { domain } = props;
    const countOfDays = getCountOfDays(+new Date(), domain.expiring_at * 1000);
    const days = countOfDays === 366 ? countOfDays - 1 : countOfDays;

    const handlePress = useCallback(() => {
      openNFT({
        address: Address.parse(domain.dns_item.address).toFriendly(),
        currency: CryptoCurrencies.Ton,
      });
    }, [domain.dns_item.address]);

    return (
      <List.Item
        onPress={handlePress}
        key={domain.name}
        title={domain.name}
        chevron
        subtitle={
          <SText
            color={days <= 30 ? 'accentNegative' : 'textSecondary'}
            variant="body2"
            numberOfLines={1}
          >
            {t('dns_renew_valid_caption', { count: days })}
          </SText>
        }
      />
    );
  },
);

export function openRenewAllDomainModal() {
  navigate('RenewAllDomains');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
