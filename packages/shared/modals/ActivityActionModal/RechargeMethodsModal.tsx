import { memo, useCallback } from 'react';
import { List, Modal, Steezy } from '@tonkeeper/uikit';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { Image } from 'react-native';
import { AppStackRouteNames } from '@tonkeeper/mobile/src/navigation';
import { delay } from '@tonkeeper/core';
import { tk } from '@tonkeeper/mobile/src/wallet';

export const RechargeMethodsModal = memo(() => {
  const nav = useNavigation();

  const handleNavigateToPromo = useCallback(() => {
    nav.replaceModal('/recharge-by-promo');
  }, []);

  const handleRechargeBattery = useCallback(async () => {
    nav.goBack();
    await delay(700);
    nav.navigate(AppStackRouteNames.BatterySend, {
      recipient: tk.wallet.address.ton.friendly,
    });
  }, []);

  return (
    <Modal>
      <Modal.Header title={t('battery.other_ways.title')} />
      <Modal.Content>
        <List>
          <List.Item
            onPress={handleRechargeBattery}
            leftContent={
              <Image
                style={styles.icon.static}
                source={require('@tonkeeper/uikit/assets/battery/recharge.png')}
              />
            }
            title={'Recharge Battery'}
            subtitle="Using TON or jUSDT"
            chevron
          />
          <List.Item
            onPress={handleRechargeBattery}
            leftContent={
              <Image
                style={styles.icon.static}
                source={require('@tonkeeper/uikit/assets/battery/gift.png')}
              />
            }
            title={'Give a battery'}
            subtitle="By wallet address"
            chevron
          />
          <List.Item
            leftContent={
              <Image
                style={styles.icon.static}
                source={require('@tonkeeper/uikit/assets/battery/promo.png')}
              />
            }
            onPress={handleNavigateToPromo}
            title={'Enter Promo Code'}
            subtitle="You're lucky"
            chevron
          />
        </List>
        <Modal.Footer />
      </Modal.Content>
    </Modal>
  );
});

export function openRechargeMethodsModal() {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: RechargeMethodsModal,
    path: '/recharge-methods',
  });
}

export const styles = Steezy.create({
  contentContainer: {
    paddingHorizontal: 16,
  },
  icon: {
    height: 44,
    width: 44,
  },
});
