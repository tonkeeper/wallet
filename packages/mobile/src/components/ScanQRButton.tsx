import React, { memo, useMemo } from 'react';
import { Icon, TouchableOpacity } from '$uikit';
import { Steezy } from '$styles';
import { store } from '$store';
import { openRequireWalletModal, openScanQR, openSend } from '$navigation';
import { isValidAddress } from '$utils';
import { CryptoCurrencies } from '$shared/constants';
import { DeeplinkOrigin, useDeeplinking } from '$libs/deeplinking';
 
export const ScanQRButton = memo(() => {
  const deeplinking = useDeeplinking();

  const hitSlop = useMemo(() => ({
    top: 26,
    bottom: 26,
    left: 26,
    right: 26,
  }), []);

  const handlePressScanQR = React.useCallback(() => {
    if (store.getState().wallet.wallet) {
      openScanQR((str) => {
        if (isValidAddress(str)) {
          setTimeout(() => {
            openSend(CryptoCurrencies.Ton, str);
          }, 200);

          return true;
        }
        
        const resolver = deeplinking.getResolver(str, {
          delay: 200,
          origin: DeeplinkOrigin.QR_CODE,
        });
        if (resolver) {
          resolver();
          return true;
        }

        return false;
      });
    } else {
      openRequireWalletModal();
    }
  }, []);


  return (
    <TouchableOpacity
      onPress={handlePressScanQR}
      style={styles.container}
      activeOpacity={0.6}
      hitSlop={hitSlop}
    >
      <Icon name="ic-viewfinder-28" color="accentPrimary" />
    </TouchableOpacity>
  );
});

const styles = Steezy.create({
  container: {
    zIndex: 3,
  }
});
