import { useNavigation } from '$libs/navigation';
import { navigate } from '$navigation/helper';
import { DnsItem, ExpiringDomainItem } from '$store/zustand/domains/types';
import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { t } from '$translation';
import { Button, List, NavBar, SText } from '$uikit';
import { Base64, ONE_YEAR_MILISEC, compareAddresses, delay, format, getCountOfDays, getLocale, ns } from '$utils';
import { memo, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from './hooks/useWallet';
import { getTimeSec } from '$utils/getTimeSec';
import TonWeb from 'tonweb';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { Ton } from '$libs/Ton';
import { openAddressMismatchModal } from '$core/ModalContainer/AddressMismatch/AddressMismatch';
import { BottomButtonWrap } from '$shared/components';
import { Toast } from '$store/zustand/toast';

export const RenewAllDomainModal = memo((props) => {
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
      </Animated.ScrollView>
      <BottomButtonWrap>
        <Button onPress={() => {}}>
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

const ExpiringListItem = memo((props: { domain: ExpiringDomainItem, onRenew: () => void; }) => {
  const { domain } = props;
  const countOfDays = getCountOfDays(+new Date(), domain.expiring_at * 1000);
  const days = countOfDays === 366 ? countOfDays - 1 : countOfDays;
  const wallet = useWallet();
  const ownerAddress = domain.dns_item.owner.address;
  const domainAddress = domain.dns_item.address;
  const remove = useExpiringDomains((state) => state.actions.remove);

  const openRenew = useCallback(async () => {
    if (!wallet || !wallet.address?.rawAddress) {
      return;
    }

    const valid_until = getTimeSec() + 10 * 60;

    const payload = new TonWeb.boc.Cell();

    payload.bits.writeUint(0x4eb1f0f9, 32);
    payload.bits.writeUint(0, 64);
    payload.bits.writeUint(0, 256);

    openSignRawModal(
      {
        source: wallet.address.rawAddress,
        valid_until,
        messages: [
          {
            address: domainAddress,
            amount: Ton.toNano('0.02'),
            payload: Base64.encodeBytes(await payload.toBoc()),
          },
        ],
      },
      {
        expires_sec: valid_until,
        response_options: {
          broadcast: false,
        },
      },
      () => {
        Toast.show(t('dns_renew_toast_success'));
        remove(domainAddress);
        props.onRenew();
      },
    );
  }, [wallet, ownerAddress]);

  const handlePress = useCallback(() => {
    if (!wallet || !wallet.address?.rawAddress) {
      return;
    }

    if (!compareAddresses(wallet.address.rawAddress, ownerAddress)) {
      return openAddressMismatchModal(openRenew, ownerAddress);
    } else {
      openRenew();
    }
  }, [wallet, ownerAddress, openRenew]);

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
});

export function openRenewAllDomainModal() {
  navigate('RenewAllDomains');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
