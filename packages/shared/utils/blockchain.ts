import { config } from '../config';
import { tk, tonapi } from '../tonkeeper';

export async function sendBocWithBattery(boc) {
  try {
    if (config.get('disable_battery') || config.get('disable_battery_send')) {
      throw new Error('Battery disabled');
    }
    return await tk.wallet.battery.sendMessage(boc);
  } catch (err) {
    return tonapi.blockchain.sendBlockchainMessage(
      {
        boc,
      },
      { format: 'text' },
    );
  }
}
