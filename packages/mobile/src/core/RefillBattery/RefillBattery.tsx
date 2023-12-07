import { memo } from 'react';
import { RefillBattery as RefillBatteryComponent } from '@tonkeeper/shared/components/RefillBattery/RefillBattery';
import { Screen } from '@tonkeeper/uikit';

export const RefillBattery = memo(() => {
  return (
    <Screen>
      <Screen.Header title={'battery.screen_title'} />
      <RefillBatteryComponent />
    </Screen>
  );
});
