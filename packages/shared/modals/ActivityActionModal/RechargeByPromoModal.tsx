import { memo, useCallback, useState } from 'react';
import {
  Button,
  Input,
  isIOS,
  Modal,
  Spacer,
  Steezy,
  Toast,
  View,
} from '@tonkeeper/uikit';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { tk } from '@tonkeeper/mobile/src/wallet';

export const RechargeByPromoModal = memo(() => {
  const [code, setCode] = useState<string>('');
  const { goBack } = useNavigation();

  const applyPromo = useCallback(async () => {
    const data = await tk.wallet.battery.applyPromo(code);
    if (data.error) {
      return Toast.fail(data.error.msg);
    }
    Toast.success(t('battery.promocode.success'));
    goBack();
  }, [code]);

  return (
    <Modal>
      <Modal.Header title={t('battery.promocode.title')} />
      <Modal.Content>
        <View style={styles.contentContainer}>
          <Input
            component={Modal.Input}
            autoFocus
            withPasteButton
            label={t('battery.promocode.placeholder')}
            withClearButton
            value={code}
            onChangeText={setCode}
          />
          <Spacer y={32} />
          <Button onPress={applyPromo} title={t('battery.promocode.apply')} />
        </View>
        <Modal.Footer />
      </Modal.Content>
    </Modal>
  );
});

export function openRechargeByPromoModal() {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: RechargeByPromoModal,
    path: '/recharge-by-promo',
  });
}

export const styles = Steezy.create({
  contentContainer: {
    paddingHorizontal: 16,
  },
});
