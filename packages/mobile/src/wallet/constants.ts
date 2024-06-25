import { WalletColor } from '@tonkeeper/uikit/src/utils/walletColor';
import { WalletContractVersion, WalletStyleConfig } from './WalletTypes';
import { t } from '@tonkeeper/shared/i18n';

export const DEFAULT_WALLET_STYLE_CONFIG: WalletStyleConfig = {
  name: t('wallet_title'),
  color: WalletColor.SteelGray,
  emoji: 'ic-wallet-32',
};

export const DEFAULT_WALLET_VERSION = WalletContractVersion.v4R2;

export const mapContractVersionToName = (
  contractVersion: WalletContractVersion,
): string => {
  switch (contractVersion) {
    case WalletContractVersion.LockupV1:
      return 'lockup-0.1';
    case WalletContractVersion.v3R1:
      return 'v3R1';
    case WalletContractVersion.v3R2:
      return 'v3R2';
    case WalletContractVersion.v4R1:
      return 'v4R1';
    case WalletContractVersion.v5R1:
      return 'W5';
    case WalletContractVersion.v4R2:
    default:
      return 'v4R2';
  }
};

export const VERSION_NAME_REGEX = /(lockup-0\.1|v3R1|v3R2|v4R1|W5|v4R2)/;
