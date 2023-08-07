#import <Foundation/Foundation.h>
#import "React/RCTViewManager.h"

@interface RCT_EXTERN_MODULE(SpoilerViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(isOn, BOOL)
RCT_EXPORT_VIEW_PROPERTY(color, NSString)
@end
