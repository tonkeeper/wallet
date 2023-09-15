import { Text } from '@tonkeeper/uikit';
import { t } from '../../../i18n';

interface FailedActionLabelProps {
  isFailed: boolean;
}

export const FailedActionLabel = ({ isFailed }: FailedActionLabelProps) => {
  if (isFailed) {
    return (
      <Text type="body1" color="accentOrange">
        {t('transactions.failed')}
      </Text>
    );
  }
};
