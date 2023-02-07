#import "TonPbkdf2.h"
#import <CommonCrypto/CommonCryptor.h>
#import <CommonCrypto/CommonDigest.h>
#import <CommonCrypto/CommonKeyDerivation.h>

@interface NSData (HexString)
+(id) dataWithHexString:(NSString*)hex;
-(NSString*) toHexString;
@end


@implementation TonPbkdf2

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(derivationKey:(NSString *_Nonnull)hexKey salt:(NSString *_Nonnull)salt iterations:(NSNumber* _Nonnull)iterations
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSError *error = nil;
    
    NSData *passwordData = [NSData dataWithHexString:hexKey];
    NSData *saltData = [salt dataUsingEncoding:NSUTF8StringEncoding];

    // Hash key (hexa decimal) string data length.
    NSMutableData *hashKeyData = [NSMutableData dataWithLength:CC_SHA512_DIGEST_LENGTH];

    // Key Derivation using PBKDF2 algorithm.
    int status = CCKeyDerivationPBKDF(
                    kCCPBKDF2,
                    passwordData.bytes,
                    passwordData.length,
                    saltData.bytes,
                    saltData.length,
                    kCCPRFHmacAlgSHA512,
                    iterations.intValue,
                    hashKeyData.mutableBytes,
                    hashKeyData.length);

    if (status == kCCParamError) {
      reject(@"keygen_fail", @"Key generation failed", error);
    } else {
      NSString* s = [hashKeyData toHexString];
      resolve(s);
    }
}

@end



@implementation NSData (HexString)

+(id) dataWithHexString:(NSString *)hex
{
  char buf[3];
  buf[2] = '\0';
  NSAssert(0 == [hex length] % 2, @"Hex strings should have an even number of digits (%@)", hex);
  unsigned char *bytes = malloc([hex length]/2);
  unsigned char *bp = bytes;
  for (CFIndex i = 0; i < [hex length]; i += 2) {
    buf[0] = [hex characterAtIndex:i];
    buf[1] = [hex characterAtIndex:i+1];
    char *b2 = NULL;
    *bp++ = strtol(buf, &b2, 16);
    NSAssert(b2 == buf + 2, @"String should be all hex digits: %@ (bad digit around %d)", hex, i);
  }
  
  return [NSData dataWithBytesNoCopy:bytes length:[hex length]/2 freeWhenDone:YES];
}

-(NSString*) toHexString {
    NSUInteger dataLength = [self length];
    NSMutableString *string = [NSMutableString stringWithCapacity:dataLength*2];
    const unsigned char *bytes = [self bytes];
    for (NSInteger idx = 0; idx < self.length; ++idx) {

      [string appendFormat:@"%02x", bytes[idx]];
    }
    return string;
}

@end
