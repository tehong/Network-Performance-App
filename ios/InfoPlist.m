//
//  InfoPlist.m
//  Beeper
//
//  Created by Eric Hong on 1/27/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "InfoPlist.h"

// reading of the Info.plist:

@implementation InfoPlist

// Expose this module to the React Native bridge
RCT_EXPORT_MODULE(InfoPlist)


// return value with a promise in JS
RCT_REMAP_METHOD(bundleShortVersion, resolver1: (RCTPromiseResolveBlock)resolve
                 rejecter1:(RCTPromiseRejectBlock)reject)
{
  
  CFBundleRef mainBundle;
  
  // Get the main bundle for the app
  mainBundle = CFBundleGetMainBundle();
  /*  bundle version number  in long Int, not very useful
   UInt32  bundleVersion;
   bundleVersion = CFBundleGetVersionNumber( mainBundle );
   */
  
  
  CFDictionaryRef bundleInfoDict;
  CFStringRef  bundleShortVersion;
  CFStringRef bundleIdentifier = NULL;

  
  // Get an instance of the non-localized keys.
  bundleInfoDict = CFBundleGetInfoDictionary( mainBundle );
  
  // If we succeeded, look for our property.
  if ( bundleInfoDict != NULL ) {
    bundleIdentifier = CFDictionaryGetValue( bundleInfoDict,
                                            CFSTR("CFBundleIdentifier") );
  }

  // If we succeeded, look for our property.
  if ( bundleInfoDict != NULL ) {
    bundleShortVersion = CFDictionaryGetValue( bundleInfoDict,
                                            CFSTR("CFBundleShortVersionString") );
  }

  if( bundleShortVersion != nil ) {
    resolve((__bridge id)(bundleShortVersion));
  } else {
    // React Native 0.19.0-RC:
    // reject(@"error", @"No version number", [NSError errorWithDomain:(__bridge NSString * _Nonnull)(bundleIdentifier) code:0 userInfo:@{ @"text": @"No version number" }]);
    
    reject([NSError errorWithDomain:(__bridge NSString * _Nonnull)(bundleIdentifier) code:0 userInfo:@{ @"text": @"No version number" }]);

  }
}

// return value with a promise in JS
RCT_REMAP_METHOD(bundleIdentifier, resolver2: (RCTPromiseResolveBlock)resolve
                 rejecter2:(RCTPromiseRejectBlock)reject)
{
  
  CFBundleRef mainBundle;
  
  // Get the main bundle for the app
  mainBundle = CFBundleGetMainBundle();
  /*  bundle version number  in long Int, not very useful
   UInt32  bundleVersion;
   bundleVersion = CFBundleGetVersionNumber( mainBundle );
   */
  
  
  CFDictionaryRef bundleInfoDict;
  CFStringRef     bundleIdentifier;
  
  // Get an instance of the non-localized keys.
  bundleInfoDict = CFBundleGetInfoDictionary( mainBundle );
  
  // If we succeeded, look for our property.
  if ( bundleInfoDict != NULL ) {
    bundleIdentifier = CFDictionaryGetValue( bundleInfoDict,
                                              CFSTR("CFBundleIdentifier") );
  }
  
  if( bundleIdentifier != nil ) {
    resolve((__bridge id)(bundleIdentifier));
  } else {
    // React Native 0.19.0-RC:
    // reject(@"error", @"No dunble identifier", [NSError errorWithDomain:(__bridge NSString * _Nonnull)(bundleIdentifier) code:0 userInfo:@{ @"text": @"No bundle identifier" }]);
    
    reject([NSError errorWithDomain:(__bridge NSString * _Nonnull)(bundleIdentifier) code:0 userInfo:@{ @"text": @"No bundle identifier" }]);

  }
}


@end
