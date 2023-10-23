import { Button, List, Spacer, Steezy, Text, Toast, View } from '@tonkeeper/uikit';
import { memo, useCallback, useEffect, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { AppIAP } from '../../modules/AppIAP';
import { iap } from '../../iap';
import { Product } from 'react-native-iap';
import { batteryapi, tk } from '../../tonkeeper';
import { platform } from '@tonkeeper/mobile/src/utils';
import { Platform } from 'react-native';
import { goBack } from '@tonkeeper/mobile/src/navigation/imperative';

const packages = [
  {
    key: 'large',
    packageId: 'Battery700',
  },
  {
    key: 'medium',
    packageId: 'Battery400',
  },
  {
    key: 'small',
    packageId: 'Battery100',
  },
];

export const RefillBatteryIAP = memo(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseInProgress, setPurchaseInProgress] = useState<boolean>(false);

  useEffect(() => {
    async function getProducts() {
      const items = await iap.getPackages(packages.map((item) => item.packageId));
      setProducts(items);
    }
    getProducts();
  }, []);

  if (!products?.length) {
    return null;
  }

  const makePurchase = useCallback(
    (packageId: string) => async () => {
      setPurchaseInProgress(true);
      const product = await iap.makePurchase(packageId);
      if (!product) return;

      if (Platform.OS === 'ios') {
        if (!product.transactionId) return;
        await tk.wallet.battery.makeIosPurchase([{ id: product.transactionId }]);
      } else {
        if (!product.purchaseToken) return;
        await tk.wallet.battery.makeAndroidPurchase([
          { token: product.purchaseToken, product_id: product.productId },
        ]);
      }
      goBack();
      Toast.success(t('battery.refilled'));
      setPurchaseInProgress(false);
    },
    [],
  );

  return (
    <>
      <List>
        {packages.map((item) => {
          const product = products.find(
            (product) => product.productId === item.packageId,
          );
          return (
            <List.Item
              title={
                <View>
                  <Text type="label1">
                    {t(`battery.packages.title.${item.key}`, {
                      price: product?.localizedPrice,
                    })}
                  </Text>
                  <Text type="body2" color="textSecondary">
                    {t(`battery.packages.subtitle.${item.key}`)}
                  </Text>
                </View>
              }
              key={item.key}
              valueContainerStyle={styles.valueContainerStyle}
              value={
                <Button
                  disabled={purchaseInProgress}
                  onPress={makePurchase(item.packageId)}
                  size="small"
                  title={t('battery.packages.buy')}
                />
              }
            />
          );
        })}
      </List>
      <Spacer y={16} />
      <Text type="label2" textAlign="center" color="textTertiary">
        {t('battery.packages.disclaimer')}
      </Text>
    </>
  );
});

const styles = Steezy.create({
  valueContainerStyle: {
    justifyContent: 'center',
  },
});
