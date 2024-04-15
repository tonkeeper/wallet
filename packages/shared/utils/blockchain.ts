import { config } from '@tonkeeper/mobile/src/config';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { ContentType } from '@tonkeeper/core/src/TonAPI';

export async function sendBoc(boc, attemptWithRelayer = true) {
  try {
    if (
      !attemptWithRelayer ||
      config.get('disable_battery') ||
      config.get('disable_battery_send')
    ) {
      throw new Error('Battery disabled');
    }
    if (
      !tk.wallet.battery?.state?.data?.balance ||
      tk.wallet.battery.state.data.balance === '0'
    ) {
      throw new Error('Zero balance');
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

export async function emulateBoc(boc, params?, attemptWithRelayer = false) {
  try {
    if (
      !attemptWithRelayer ||
      config.get('disable_battery') ||
      config.get('disable_battery_send')
    ) {
      throw new Error('Battery disabled');
    }
    if (
      !tk.wallet.battery?.state?.data?.balance ||
      tk.wallet.battery.state.data.balance === '0'
    ) {
      throw new Error('Zero balance');
    }
    const emulateResult = await tk.wallet.battery.emulate(boc);
    return { emulateResult, battery: true };
  } catch (err) {
    const emulateResult = await tk.wallet.tonapi.wallet.emulateMessageToWallet({
      boc,
      params,
    });
    return { emulateResult, battery: false };
  }
}
