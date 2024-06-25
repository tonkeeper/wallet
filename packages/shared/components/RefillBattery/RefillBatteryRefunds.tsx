import React, { memo, useCallback } from 'react';
import { openDAppBrowser } from '@tonkeeper/mobile/src/navigation';
import { config } from '@tonkeeper/mobile/src/config';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { List, Steezy } from '@tonkeeper/uikit';
import { Image } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';

export const RefillBatteryRefunds = memo((props) => {
  const openRefundsDApp = useCallback(() => {
    openDAppBrowser(
      config.get('batteryRefundEndpoint'),
      `token=${encodeURIComponent(tk.wallet.tonProof.tonProofToken)}` +
        `&testnet=${tk.wallet.isTestnet}`,
      true,
    );
  }, []);

  return (
    <List indent={false}>
      <List.Item
        leftContent={
          <Image
            style={styles.icon.static}
            source={require('@tonkeeper/uikit/assets/battery/refunds.png')}
          />
        }
        chevron
        title={t('battery.refund.title')}
        subtitle={t('battery.refund.subtitle')}
        onPress={openRefundsDApp}
      />
    </List>
  );
});

const styles = Steezy.create({
  icon: {
    height: 44,
    width: 44,
  },
});
