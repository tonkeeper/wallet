import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '$uikit/Button/Button';
import { Text } from '$uikit/Text/Text';
import { t } from '$translation';
import { format } from 'date-fns';
import { ONE_YEAR_MILISEC, getCountOfDays, getLocale } from '$utils/date';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { getTimeSec } from '$utils/getTimeSec';
import { Ton } from '$libs/Ton';

import { openAddressMismatchModal } from '$core/ModalContainer/AddressMismatch/AddressMismatch';
import { compareAddresses } from '$utils/address';
import { useWallet } from '$hooks';

export type RenewDomainButtonRef = {
  renewUpdated: () => void;
};

interface RenewDomainButtonProps {
  domainAddress: string;
  ownerAddress: string;
  disabled?: boolean;
  loading?: boolean;
  expiringAt: number;
  onSend: () => void;
}

export const RenewDomainButton = forwardRef<RenewDomainButtonRef, RenewDomainButtonProps>((props, ref) => {
    const { disabled, expiringAt, loading, onSend, domainAddress, ownerAddress } = props;
    const [isPending, setIsPending] = useState(false);
    const wallet = useWallet();

    useImperativeHandle(ref, () => ({
      renewUpdated: () => setIsPending(false),
    }));

    const openRenew = useCallback(() => {
      if (!wallet || !wallet.address?.rawAddress) {
        return;
      }

      const valid_until = getTimeSec() + 10 * 60;

      openSignRawModal(
        {
          source: wallet.address.rawAddress,
          valid_until,
          messages: [
            {
              address: domainAddress,
              amount: Ton.toNano('0.015'),
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
          setIsPending(true);
          onSend();
        },
      );
    }, [wallet, ownerAddress]);

    const handlePressButton = useCallback(() => {
      if (!wallet || !wallet.address?.rawAddress) {
        return;
      }

      if (!compareAddresses(wallet.address.rawAddress, ownerAddress)) {
        return openAddressMismatchModal(openRenew, ownerAddress);
      } else {
        openRenew();
      }
    }, [wallet, ownerAddress, openRenew]);

    if (loading) {
      return null;
    }

    const countOfDays = getCountOfDays(+new Date(), expiringAt);
    const days = countOfDays === 366 ? countOfDays - 1 : countOfDays;

    return (
      <View style={styles.container}>
        <Button
          disabled={disabled || isPending}
          style={{ marginBottom: 12 }}
          onPress={handlePressButton}
          mode="secondary"
          size="large"
        >
          {isPending
            ? t('dns_renew_in_progress_btn')
            : t('dns_renew_until_btn', {
                untilDate: format(+new Date() + ONE_YEAR_MILISEC, 'dd MMM yyyy', {
                  locale: getLocale(),
                }),
              })}
        </Button>
        <Text
          color={days <= 30 ? 'accentNegative' : 'textSecondary'}
          variant="body2"
          textAlign="center"
        >
          {t('dns_renew_valid_caption', { count: days })}
        </Text>
      </View>
    );
  });


const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});
