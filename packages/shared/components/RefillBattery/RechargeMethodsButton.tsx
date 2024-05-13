import React, { memo, useEffect } from 'react';
import { Button, View } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { openRechargeMethodsModal } from '../../modals/ActivityActionModal/RechargeMethodsModal';
import { useBatteryRechargeMethods } from '../../query/hooks';
import { Skeleton } from '@tonkeeper/mobile/src/uikit';

export const RechargeMethodsButton = memo(() => {
  const { methods, isLoading, reload } = useBatteryRechargeMethods();

  const titles = methods.map((method) => method.symbol).join(', ');

  useEffect(() => {
    reload();
  }, []);

  return (
    <View>
      <Button
        disabled={isLoading}
        onPress={openRechargeMethodsModal}
        color="secondary"
        size="withSubtitle"
        title={t('battery.other_ways.button.title')}
        subtitle={
          isLoading ? (
            <Skeleton.Line width={80} />
          ) : (
            t('battery.other_ways.button.subtitle', { methods: titles })
          )
        }
      />
    </View>
  );
});
