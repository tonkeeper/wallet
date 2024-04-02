import { memo } from 'react';
import { RefillBattery as RefillBatteryComponent } from '@tonkeeper/shared/components/RefillBattery/RefillBattery';
import { t } from '@tonkeeper/shared/i18n';
import { Screen, Steezy, View } from '@tonkeeper/uikit';

export const RefillBattery = memo(() => {
  return (
    <Screen>
      <Screen.Header title={t('battery.screen_title')} />
      <Screen.ScrollView>
        <View style={styles.container}>
          <RefillBatteryComponent />
        </View>
      </Screen.ScrollView>
    </Screen>
  );
});

const styles = Steezy.create({
  container: {
    marginBottom: 16,
  },
});
