import {
  Button,
  Icon,
  IconNames,
  List,
  Spacer,
  Steezy,
  Text,
  Toast,
  View,
} from '@tonkeeper/uikit';
import { memo, useCallback, useEffect, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { Platform } from 'react-native';
import { useIAP } from 'react-native-iap';
import { SkeletonLine } from '@tonkeeper/mobile/src/uikit/Skeleton/SkeletonLine';
import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';
import { CryptoCurrencies } from '@tonkeeper/mobile/src/shared/constants';
import BigNumber from 'bignumber.js';
import { config } from '@tonkeeper/mobile/src/config';
import { useExternalState } from '../../hooks/useExternalState';

export interface InAppPackage {
  icon: IconNames;
  key: string;
  // TODO: move to backend
  userProceed: number;
  packageId: string;
}

const packages: InAppPackage[] = [
  {
    icon: 'ic-battery-100-44',
    key: 'large',
    userProceed: 7.5,
    packageId: 'LargePack',
  },
  {
    icon: 'ic-battery-50-44',
    key: 'medium',
    userProceed: 5,
    packageId: 'MediumPack',
  },
  {
    icon: 'ic-battery-25-44',
    key: 'small',
    userProceed: 2.5,
    packageId: 'SmallPack',
  },
];

export const RefillBatteryIAP = memo(() => {
  const [purchaseInProgress, setPurchaseInProgress] = useState<boolean>(false);
  const { products, getProducts, requestPurchase, finishTransaction } = useIAP();
  const tonPriceInUsd = useTokenPrice(CryptoCurrencies.Ton).usd;
  const batteryBalance = useExternalState(
    tk.wallet.battery.state,
    (state) => state.balance,
  );
  const reservedBalance = useExternalState(
    tk.wallet.battery.state,
    (state) => state.reservedBalance,
  );

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
        setPurchaseInProgress(false);

        // SKErrorDomain, code=2 - user cancelled. Ignore this error
        const regEx = /SKErrorDomain,.*2/;
        if (!regEx.test(e.message)) {
          Toast.fail(e.message);
        }
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
              leftContent={
                <Icon
                  style={styles.listItemIcon.static}
                  imageStyle={styles.listItemIcon.static}
                  colorless
                  name={item.icon}
                />
              }
              title={
                <View>
                  <View style={styles.priceContainer}>
                    <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
                      {t(`battery.packages.title.${item.key}`)}
                    </Text>
                  </View>
                  <Text type="body2" color="textSecondary">
                    {t(`battery.packages.subtitle`, {
                      count: new BigNumber(item.userProceed)
                        .div(tonPriceInUsd)
                        .minus(
                          reservedBalance === '0' &&
                            (!batteryBalance || batteryBalance === '0')
                            ? config.get('batteryReservedAmount')
                            : 0,
                        )
                        .div(config.get('batteryMeanFees'))
                        .decimalPlaces(0)
                        .toNumber(),
                    })}
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
                  title={product?.localizedPrice ?? 'Loading'}
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemIcon: {
    width: 26,
    height: 44,
  },
});
