import { config } from '@tonkeeper/mobile/src/config';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { ContentType, ServiceStatus } from '@tonkeeper/core/src/TonAPI';
import { TransactionService } from '@tonkeeper/core';
import { t } from '../i18n';
import { Alert } from 'react-native';

export class IndexerLatencyError extends Error {}

export async function sendBoc(boc, attemptWithRelayer = true) {
  const { rest_online, indexing_latency } =
    (await tk.wallet.tonapi.status.status()) as ServiceStatus;

  if (!rest_online || indexing_latency > TransactionService.TTL - 30) {
    throw new IndexerLatencyError(t('indexer_latency_error'));
  }

  try {
    if (
      !attemptWithRelayer ||
      config.get('disable_battery') ||
      config.get('disable_battery_send')
    ) {
      throw new Error('Battery disabled');
    }

    return await tk.wallet.battery.sendMessage(boc);
  } catch (err) {
    return await tk.wallet.tonapi.blockchain.sendBlockchainMessage(
      {
        boc,
      },
      { type: ContentType.Json, format: 'text' },
    );
  }
}

export async function emulateBoc(
  boc,
  params?,
  attemptWithRelayer = false,
  forceRelayer = false,
) {
  try {
    if (
      !attemptWithRelayer ||
      config.get('disable_battery') ||
      config.get('disable_battery_send')
    ) {
      throw new Error('Battery disabled');
    }

    if (
      !forceRelayer &&
      (!tk.wallet.battery?.state?.data?.balance ||
        tk.wallet.battery.state.data.balance === '0')
    ) {
      throw new Error('Zero balance');
    }
    const { consequences, withBattery } = await tk.wallet.battery.emulate(boc);
    return { emulateResult: consequences, battery: withBattery };
  } catch (err) {
    const emulateResult = await tk.wallet.tonapi.wallet.emulateMessageToWallet({
      boc,
      params,
    });
    return { emulateResult, battery: false };
  }
}

export async function getRawTimeFromLiteserverSafely(): Promise<number> {
  try {
    const res = await tk.wallet.tonapi.liteserver.getRawTime({
      headers: {
        'Cache-Control': 'no-cache',
      },
      cache: 'no-cache',
    });
    return res.time;
  } catch (e) {
    return Math.floor(Date.now() / 1e3);
  }
}

export async function getTimeoutFromLiteserverSafely() {
  return (await getRawTimeFromLiteserverSafely()) + TransactionService.TTL;
}
