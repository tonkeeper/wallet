import { memo } from 'react';
import { RefillBattery as RefillBatteryComponent } from '@tonkeeper/shared/components/RefillBattery/RefillBattery';
import { t } from '@tonkeeper/shared/i18n';
import { ScrollHandler } from '$uikit';

export const RefillBattery = memo(() => {
  return (
    <ScrollHandler
      isLargeNavBar={false}
      navBarTitle={t('battery.screen_title')}
      navBarSubtitle={'Beta'}
      subtitleProps={{ color: 'accentOrange' }}
    >
      <RefillBatteryComponent />
    </ScrollHandler>
  );
});
