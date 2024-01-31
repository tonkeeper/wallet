import { memo } from 'react';
import { Button, View } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { openRechargeByPromoModal } from '../../modals/ActivityActionModal/RechargeByPromoModal';

export const RechargeByPromoButton = memo(() => {
  return (
    <View>
      <Button
        onPress={openRechargeByPromoModal}
        color="secondary"
        title={t('battery.promocode.button')}
      />
    </View>
  );
});
