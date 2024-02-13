import { Button, List, Spacer, Steezy, Text, Toast, View } from '@tonkeeper/uikit';
import { memo, useCallback, useEffect, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { Platform } from 'react-native';
import { goBack } from '@tonkeeper/mobile/src/navigation/imperative';
import { useIAP } from 'react-native-iap';
import { SkeletonLine } from '@tonkeeper/mobile/src/uikit/Skeleton/SkeletonLine';

const packages = [
  {
    key: 'large',
    transactions: 700,
    packageId: 'Battery700',
  },
  {
    key: 'medium',
    transactions: 400,
    packageId: 'Battery400',
  },
  {
    key: 'small',
    transactions: 100,
    packageId: 'Battery100',
  },
];

export const RefillBatteryIAP = memo(() => {
  const [purchaseInProgress, setPurchaseInProgress] = useState<boolean>(false);
  const { products, getProducts, requestPurchase, connected } = useIAP();

  useEffect(() => {
    getProducts({
      skus: packages.map((item) => item.packageId),
    });
  }, [getProducts]);

  const makePurchase = useCallback(
    (packageId: string) => async () => {
      setPurchaseInProgress(true);
      let product = await requestPurchase({ sku: packageId });
      if (!product) return;

      if (Array.isArray(product)) product = product[0];

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
      <List indent={false}>
        {packages.map((item) => {
          const product = products.find(
            (product) => product.productId === item.packageId,
          );
          return (
            <List.Item
              title={
                <View>
                  <View style={styles.titleContainer}>
                    <Text type="label1">
                      {t(`battery.packages.title`, {
                        price: product?.localizedPrice ?? '',
                        cnt: item.transactions,
                      })}
                    </Text>
                    <Spacer x={4} />
                    {!product?.localizedPrice && <SkeletonLine height={24} width={40} />}
                  </View>
                  <Text type="body2" color="textSecondary">
                    {t(`battery.packages.subtitle.${item.key}`)}
                  </Text>
                </View>
              }
              key={item.key}
              valueContainerStyle={styles.valueContainerStyle}
              value={
                <Button
                  disabled={purchaseInProgress || !product}
                  onPress={makePurchase(item.packageId)}
                  size="small"
                  title={t('battery.packages.buy')}
                />
              }
            />
          );
        })}
      </List>
    </>
  );
});

const styles = Steezy.create({
  valueContainerStyle: {
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
