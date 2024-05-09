import {
  checkAndRequestAndroidBluetooth,
  showBluetoothPermissionsAlert,
  showBluetoothPoweredOffAlert,
} from '$utils/bluetoothPermissions';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { delay } from '@tonkeeper/core';
import { isIOS } from '@tonkeeper/uikit';
import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export const useBluetoothAvailable = () => {
  const [available, setAvailable] = useState<boolean>(false);

  useEffect(() => {
    const subscription = new Observable(TransportBLE.observeState).subscribe({
      next: async (event) => {
        if (event.type === 'Unauthorized') {
          console.log('Bluetooth Unauthorized');
          if (isIOS) {
            showBluetoothPermissionsAlert();
          }
        }
        if (event.type === 'PoweredOff') {
          console.log('Bluetooth Powered Off');
          showBluetoothPoweredOffAlert();
        }

        if (event.type === 'PoweredOn') {
          if (isIOS) {
            setAvailable(event.available);
          } else {
            try {
              await delay(1000);
              const granted = await checkAndRequestAndroidBluetooth();
              setAvailable(granted);
            } catch {
              setAvailable(false);
            }
          }
        }
      },
      complete: () => {},
      error: () => {},
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return available;
};
