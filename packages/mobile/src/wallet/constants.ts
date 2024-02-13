import { WalletColor } from '@tonkeeper/uikit/src/utils/walletColor';
import { WalletStyleConfig } from './WalletTypes';
import { t } from '@tonkeeper/shared/i18n';

export const DEFAULT_WALLET_STYLE_CONFIG: WalletStyleConfig = {
  name: t('wallet_title'),
  color: WalletColor.SteelGray,
  emoji: '😀',
};
