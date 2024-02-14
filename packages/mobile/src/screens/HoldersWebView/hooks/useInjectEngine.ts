import * as React from 'react';
import { InjectEngine } from './InjectEngine';
import { Cell, Slice } from '@ton/core';
import { useDeeplinking } from '$libs/deeplinking';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';

function parseString(slice: Slice) {
  let res = slice.loadBuffer(Math.floor(slice.remainingBits / 8)).toString();
  let rr = slice;
  if (rr.remainingRefs > 0) {
    rr = rr.loadRef().asSlice();
    res += rr.loadBuffer(Math.floor(rr.remainingBits / 8)).toString();
  }
  return res;
}

export function useInjectEngine(domain: string, name: string, isTestnet: boolean) {
  const deeplinking = useDeeplinking();
  return React.useMemo(() => {
    const inj = new InjectEngine();
    inj.registerMethod('tx', async (src: any) => {
      // Check network
      if (isTestnet && src.network !== 'testnet') {
        throw Error('Invalid network');
      }
      if (!isTestnet && src.network !== 'mainnet') {
        throw Error('Invalid network');
      }

      // Callback
      let callback: (ok: boolean, res: Cell | null) => void;
      let future = new Promise<{ state: 'sent' | 'rejected'; result: Cell | null }>(
        (resolve) => {
          callback = (ok, res) => {
            resolve({ state: ok ? 'sent' : 'rejected', result: res });
          };
        },
      );

      // Navigation
      openSignRawModal(
        {
          messages: [
            {
              amount: src.value,
              address: src.to,
              payload: src.payload ? src.payload : null,
              stateInit: src.stateInit ? src.stateInit : null,
            },
          ],
        },
        {},
      );

      return await future;
    });
    inj.registerMethod('sign', async (src: any) => {
      // Check network
      if (isTestnet && src.network !== 'testnet') {
        throw Error('Invalid network');
      }
      if (!isTestnet && src.network !== 'mainnet') {
        throw Error('Invalid network');
      }

      // Callback
      let callback: (ok: boolean, res: Cell | null) => void;
      let future = new Promise<{ state: 'sent' | 'rejected'; result: Cell | null }>(
        (resolve) => {
          callback = (ok, res) => {
            resolve({ state: ok ? 'sent' : 'rejected', result: res });
          };
        },
      );

      /* navigation.navigateSign({
        textCell: src.textCell,
        payloadCell: src.payloadCell,
        text: parseString(src.textCell.beginParse()),
        job: null,
        callback: callback!,
        name,
      });*/

      return await future;
    });
    return inj;
  }, [deeplinking]);
}
