import {
  checkAndRequestAndroidBluetooth,
  showBluetoothPermissionsAlert,
  showBluetoothPoweredOffAlert,
} from '$utils/bluetoothPermissions';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { isIOS } from '@tonkeeper/uikit';
import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export const useBluetoothAvailable = () => {
  const [available, setAvailable] = useState<boolean>(false);

  useEffect(() => {
    const subscription = new Observable(TransportBLE.observeState).subscribe({
      next: async (event) => {
        setAvailable(event.available);

        if (event.type === 'Unauthorized') {
          console.log('Bluetooth Unauthorized');
          if (isIOS) {
            showBluetoothPermissionsAlert();
          } else {
            await checkAndRequestAndroidBluetooth();
          }
        }
        if (event.type === 'PoweredOff') {
          console.log('Bluetooth Powered Off');
          showBluetoothPoweredOffAlert();
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
