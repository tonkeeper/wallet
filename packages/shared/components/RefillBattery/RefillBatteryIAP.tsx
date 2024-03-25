import { Button, List, Spacer, Steezy, Text, Toast, View } from '@tonkeeper/uikit';
import { memo, useCallback, useEffect, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { Platform } from 'react-native';
import { useIAP } from 'react-native-iap';
import { SkeletonLine } from '@tonkeeper/mobile/src/uikit/Skeleton/SkeletonLine';

const packages = [
  {
    key: 'large',
    transactions: 700,
    packageId: 'LargePack',
  },
  {
    key: 'medium',
    transactions: 400,
    packageId: 'MediumPack',
  },
  {
    key: 'small',
    transactions: 100,
    packageId: 'SmallPack',
  },
];

export const RefillBatteryIAP = memo(() => {
  const [purchaseInProgress, setPurchaseInProgress] = useState<boolean>(false);
  const { products, getProducts, requestPurchase, finishTransaction } = useIAP();

  useEffect(() => {
    getProducts({
      skus: packages.map((item) => item.packageId),
    });
  }, [getProducts]);

  const makePurchase = useCallback(
    (packageId: string) => async () => {
      try {
        setPurchaseInProgress(true);
        let requestedPurchase = await requestPurchase({ sku: packageId });

        if (!requestedPurchase) {
          return;
        }

        const purchasesArray = Array.isArray(requestedPurchase)
          ? requestedPurchase
          : [requestedPurchase];

        if (Platform.OS === 'ios') {
          const processedTransactions = await tk.wallet.battery.makeIosPurchase(
            purchasesArray.map((purchase) => ({ id: purchase.transactionId })),
          );

          for (let purchase of purchasesArray) {
            if (
              !processedTransactions ||
              !processedTransactions.find(
                (processedTransaction) =>
                  purchase.transactionId === processedTransaction.transaction_id,
              )
            ) {
              continue;
            }
            await finishTransaction({ purchase, isConsumable: true });
          }
        } else if (Platform.OS === 'android') {
          await tk.wallet.battery.makeAndroidPurchase(
            purchasesArray.map((purchase) => ({
              token: purchase.purchaseToken,
              product_id: purchase.productId,
            })),
          );
        }

        Toast.success(t('battery.refilled'));
        setPurchaseInProgress(false);
      } catch (e) {
        console.log(e);
        setPurchaseInProgress(false);
        Toast.fail(e.message);
      }
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
              titleContainerStyle={styles.titleContainer.static}
              title={
                <View>
                  <View style={styles.priceContainer}>
                    <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
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
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
