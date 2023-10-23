import { getProducts, initConnection, requestPurchase } from 'react-native-iap';

export class AppIAP {
  constructor() {
    initConnection();
  }
  public async getPackages(packageIds: string[]) {
    return await getProducts({ skus: packageIds });
  }
  public async makePurchase(sku: string) {
    const purchase = await requestPurchase({
      sku,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });
    if (Array.isArray(purchase)) {
      return purchase[0];
    }
    return purchase;
  }
}
