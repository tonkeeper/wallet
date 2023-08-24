import Clipboard from '@react-native-community/clipboard';
import { t } from '@tonkeeper/shared/i18n';
import { Toast } from '../components/Toast';

export const copyText = (value?: string | boolean) => () => {
  if (value) {
    Clipboard.setString(String(value));
    Toast.success(t('copied'));
  }
};
