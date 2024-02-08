import Clipboard from '@react-native-community/clipboard';
import { t } from '@tonkeeper/shared/i18n';
import { Toast } from '../components/Toast';
import { tk } from '@tonkeeper/mobile/src/wallet';

export const copyText = (value?: string | boolean, toastMessage?: string) => () => {
  if (value) {
    Clipboard.setString(String(value));
    const message = toastMessage ?? t('copied');
    if (tk.wallet?.isTestnet || tk.wallet?.isWatchOnly) {
      Toast.warning(message);
    } else {
      Toast.success(message);
    }
  }
};
