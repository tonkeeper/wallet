import { memo } from 'react';
import { Button, View } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { openRechargeMethodsModal } from '../../modals/ActivityActionModal/RechargeMethodsModal';

export const RechargeMethodsButton = memo(() => {
  return (
    <View>
      <Button
        onPress={openRechargeMethodsModal}
        color="secondary"
        size="withSubtitle"
        title={t('battery.other_ways.button.title')}
        subtitle={t('battery.other_ways.button.subtitle')}
      />
    </View>
  );
});
