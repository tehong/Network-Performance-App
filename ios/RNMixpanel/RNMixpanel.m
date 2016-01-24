//
//  RNMixpanel.m
//  RNMixpanel
//
//  Created by Eric Hong on 10/3/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import "RNMixpanel.h"
#import "Mixpanel.h"

@implementation RNMixpanel

Mixpanel *mixpanel = nil;
 
// Expose this module to the React Native bridge
RCT_EXPORT_MODULE(RNMixpanel)

// sharedInstanceWithToken
RCT_EXPORT_METHOD(sharedInstanceWithToken:(NSString *)apiToken) {
  
  // NSLog(@"%@ %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd));
  
  [Mixpanel sharedInstanceWithToken:apiToken];
  mixpanel = [Mixpanel sharedInstance];

}


// track

/* Skip this method, just use the general method
RCT_EXPORT_METHOD(track:(NSString *)event) {
  
  NSLog(@"%@ %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd));
  [mixpanel track:event];
  [mixpanel flush];
  
}
 */

// track with properties

RCT_EXPORT_METHOD(track:(NSString *)event properties:(NSDictionary *)properties) {
  
  // NSLog(@"%@ %@ event: %@, properties: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd), event, properties);
  [mixpanel track:event properties:properties];
  [mixpanel flush];
  
}



@end
