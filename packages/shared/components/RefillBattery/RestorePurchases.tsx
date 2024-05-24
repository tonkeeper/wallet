import React, { memo, useCallback } from 'react';
import { Steezy, Text, Toast, TouchableOpacity } from '@tonkeeper/uikit';
import { t } from '../../i18n';
import { getPendingPurchasesIOS, finishTransaction } from 'react-native-iap';
import { Platform } from 'react-native';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { openDAppBrowser } from '@tonkeeper/mobile/src/navigation';
import { config } from '@tonkeeper/mobile/src/config';
import { useExternalState } from '../../hooks/useExternalState';

export const RestorePurchases = memo(() => {
  const reservedBalance = useExternalState(
    tk.wallet.battery.state,
    (state) => state.reservedBalance,
  );
  const handleRestorePurchases = useCallback(async () => {
    try {
      const purchases = await getPendingPurchasesIOS();

      if (!purchases.length) {
        return Toast.fail('Nothing to restore');
      }

      if (Platform.OS === 'ios') {
        const processedTransactions = await tk.wallet.battery.makeIosPurchase(
          purchases.map((purchase) => ({ id: purchase.transactionId })),
        );

        for (let purchase of purchases) {
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
          purchases.map((purchase) => ({
            token: purchase.purchaseToken,
            product_id: purchase.productId,
          })),
        );
      }
      Toast.success(t('battery.refilled'));
    } catch (e) {
      Toast.fail(e.message);
    }
  }, []);

  const openRefundsDApp = useCallback(() => {
    openDAppBrowser(
      config.get('batteryRefundEndpoint'),
      `token=${encodeURIComponent(tk.wallet.tonProof.tonProofToken)}` +
        `&testnet=${tk.wallet.isTestnet}`,
      true,
    );
  }, []);

  return (
    <>
      <Text
        style={styles.text.static}
        type="body2"
        textAlign="center"
        color="textTertiary"
      >
        {t('battery.packages.disclaimer')}{' '}
        <Text
          onPress={handleRestorePurchases}
          type="body2"
          textAlign="center"
          color="textSecondary"
        >
          {t('battery.packages.restore')}
        </Text>
        .
      </Text>
      {!(!reservedBalance || reservedBalance === '0') && (
        <Text
          style={styles.text.static}
          type="body2"
          textAlign="center"
          color="textTertiary"
        >
          <Text
            onPress={openRefundsDApp}
            type="body2"
            textAlign="center"
            color="textSecondary"
          >
            {t('battery.packages.refund')}
          </Text>
          .
        </Text>
      )}
    </>
  );
});

const styles = Steezy.create({
  text: {
    paddingHorizontal: 16,
  },
});
