#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WalletStore, NSObject);

RCT_EXTERN_METHOD(validate:(NSArray<NSString *> *)words resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(importWalletWithPasscode:(NSArray<NSString *> *)words passcode:(nonnull NSString *)passcode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(importWalletWithBiometry:(NSArray<NSString *> *)words resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(listWallets:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(removeWallets:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getWallet:(nonnull NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(getWalletByAddress:(nonnull NSString *)address resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(updateWallet:(nonnull NSString *)id label:(nonnull NSString *)label resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(removeWallet:(nonnull NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(currentWalletInfo:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(setCurrentWallet:(nonnull NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(exportKey:(nonnull NSString *)pk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(exportWithPasscode:(nonnull NSString *)pk passcode:(nonnull NSString *)passcode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(exportWithBiometry:(nonnull NSString *)pk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(backup:(nonnull NSString *)pk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(backupWithPasscode:(nonnull NSString *)pk passcode:(nonnull NSString *)passcode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);
RCT_EXTERN_METHOD(backupWithBiometry:(nonnull NSString *)pk resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject);

@end
