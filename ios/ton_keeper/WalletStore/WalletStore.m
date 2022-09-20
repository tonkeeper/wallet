#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WalletStore, NSObject);

RCT_EXTERN_METHOD(listWallets:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(importWallet:(nonnull NSString *)seed (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(getWallet:(nonnull NSString *)id (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(getWalletByAddress:(nonnull NSString *)address (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(updateWallet:(nonnull NSString *)id (nonnull NSString *)label (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(currentWalletInfo:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(setCurrentWallet:(nonnull NSString *)id (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

@end
