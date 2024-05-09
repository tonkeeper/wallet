import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { useEffect, useState } from 'react';

export const usePairLedger = (available: boolean) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (!available) {
      return;
    }

    let currentDeviceId = '';

    const subscription = TransportBLE.listen({
      complete: () => {
        // this.setState({ refreshing: false });
      },
      next: async (event) => {
        if (event.type === 'add') {
          const device = event.descriptor;
          // prevent duplicate alerts
          if (currentDeviceId === device.id) {
            return;
          }
          // set the current device id to prevent duplicate alerts
          currentDeviceId = device.id;

          setDeviceId(device.id);
        }
      },
      error: (error) => {
        console.log('Error Pairing');
        // this.setState({ error, refreshing: false });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [available]);

  return deviceId;
};
