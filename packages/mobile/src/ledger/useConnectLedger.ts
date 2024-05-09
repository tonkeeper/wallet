import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import Transport from '@ledgerhq/hw-transport';
import { useCallback, useEffect, useState } from 'react';
import { TonTransport } from '@ton-community/ton-ledger';

export function useConnectLedger(deviceId: string | null) {
  const [transport, setTransport] = useState<Transport | null>(null);
  const [tonTransport, setTonTransport] = useState<TonTransport | null>(null);
  const [isAppOpenRetry, setIsAppOpenRetry] = useState(0);

  const [connectError, setConnectError] = useState(false);

  const connect = useCallback(async () => {
    if (!deviceId) {
      return;
    }

    try {
      const bleTransport = await TransportBLE.open(deviceId);
      setTransport(bleTransport);
      console.log('bleTransport', bleTransport.device.id);
    } catch (error) {
      console.log('connect error', error.message);
      setConnectError(true);
    }
  }, [deviceId]);

  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  useEffect(() => {
    if (!connectError) {
      return;
    }

    const timeout = setTimeout(() => {
      setConnectError(false);
      connect();
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError]);

  useEffect(() => {
    let timeout: any;

    if (!transport) {
      return;
    }

    const handler = () => {
      console.log('disconnect, retry...');
      connect();
      timeout = setTimeout(() => {
        setTransport(null);
        setTonTransport(null);
      }, 2000);
    };

    transport.on('disconnect', handler);

    return () => {
      transport.off('disconnect', handler);
      transport.close();
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [transport, connect]);

  useEffect(() => {
    if (!transport) {
      return;
    }

    const timeout = setTimeout(async () => {
      const newTonTransport = new TonTransport(transport);
      try {
        const isAppOpen = await newTonTransport.isAppOpen();
        if (isAppOpen) {
          console.log('setTonTransport ');
          setTonTransport(newTonTransport);
        } else {
          setIsAppOpenRetry((s) => s + 1);
        }
      } catch (e) {
        console.log('isAppOpen error', e);
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
      setTonTransport(null);
    };
  }, [transport, isAppOpenRetry]);

  return { transport, tonTransport };
}
