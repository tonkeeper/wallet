import { config } from '$config';
import { Address, BitString } from '@ton/core';
import { t } from '@tonkeeper/shared/i18n';
import { getRawTimeFromLiteserverSafely } from '@tonkeeper/shared/utils/blockchain';
import { Toast } from '@tonkeeper/uikit';
import { ToastSize } from '@tonkeeper/uikit/src/components/Toast';
import { intervalToDuration } from 'date-fns';

export const getNotcoinBurnAddress = (nftAddress: string) => {
  const nftAddressBits = new BitString(Address.parse(nftAddress).hash, 0, 4);

  const burnAddresses = config.get('notcoin_burn_addresses');
  const burnAddressesBits = config
    .get('notcoin_burn_addresses')
    .map((address: string) => new BitString(Address.parse(address).hash, 0, 4));

  const index = burnAddressesBits.findIndex((item) => nftAddressBits.equals(item));

  return Address.parse(burnAddresses[index]);
};

export const checkBurnDate = async () => {
  const burnTimestamp = config.get('notcoin_burn_date');
  const nowTimestamp = await getRawTimeFromLiteserverSafely();

  if (burnTimestamp > nowTimestamp) {
    const duration = intervalToDuration({
      start: nowTimestamp * 1000,
      end: burnTimestamp * 1000,
    });

    if (duration.hours && duration.hours > 0) {
      Toast.fail(t('notcoin.burn_not_available.hours', { count: duration.hours }), {
        size: ToastSize.Small,
      });
    } else if (duration.minutes && duration.minutes > 1) {
      Toast.fail(t('notcoin.burn_not_available.minutes', { count: duration.minutes }), {
        size: ToastSize.Small,
      });
    } else {
      Toast.fail(t('notcoin.burn_not_available.seconds', { count: duration.seconds }), {
        size: ToastSize.Small,
      });
    }
    return false;
  }

  return true;
};
