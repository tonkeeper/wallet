
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNApkInstallSpec.h"

@interface ApkInstall : NSObject <NativeApkInstallSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ApkInstall : NSObject <RCTBridgeModule>
#endif

@end
