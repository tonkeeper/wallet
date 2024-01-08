import { config } from '../config';
import { tk, tonapi } from '../tonkeeper';
import { ContentType } from '@tonkeeper/core/src/TonAPI';

export async function sendBocWithBattery(boc) {
  try {
    if (config.get('disable_battery') || config.get('disable_battery_send')) {
      throw new Error('Battery disabled');
    }
    return await tk.wallet.battery.sendMessage(boc);
  } catch (err) {
    return await tonapi.blockchain.sendBlockchainMessage(
      {
        boc,
      },
      { type: ContentType.Json, format: 'text' },
    );
  }
}

export async function emulateWithBattery(boc) {
  try {
    if (config.get('disable_battery') || config.get('disable_battery_send')) {
      throw new Error('Battery disabled');
    }
    const emulateResult = await tk.wallet.battery.emulate(boc);
    return { emulateResult, battery: true };
  } catch (err) {
    const emulateResult = await tonapi.wallet.emulateMessageToWallet({
      boc,
    });
    return { emulateResult, battery: false };
  }
}
