//
//  ParseInit.m
//  Beeper
//
//  Created by Eric Hong on 1/25/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

// #import <Foundation/Foundation.h>

#import "AppDelegate.h"
#import "ParseInit.h"
#import <Parse/Parse.h>

@implementation ParseInit

// Expose this module to the React Native bridge
RCT_EXPORT_MODULE(ParseInit)

// init the parse with the right app ID and Key, also start the
RCT_EXPORT_METHOD(init:(NSString *)appId key: (NSString *)appKey user: (NSString *)userObjectId) {
  
  // NSLog(@"%@ %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd));
  
  UIApplication *app = [UIApplication sharedApplication];
  [Parse setApplicationId:appId clientKey:appKey];
  
  
  UIUserNotificationType userNotificationTypes = (UIUserNotificationTypeAlert |
                                                  UIUserNotificationTypeBadge |
                                                  UIUserNotificationTypeSound);
  UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:userNotificationTypes
                                                                           categories:nil];
  [app registerUserNotificationSettings:settings];
  [app registerForRemoteNotifications];

  
  // Associate the device with a user
  PFInstallation *installation = [PFInstallation currentInstallation];
  // No [PFUser currentUser] since we logged in in the JS code so we need to pass in the appUser here
  
  installation[@"userObjectId"] = userObjectId;
  [installation saveInBackground];

}

// get the badge number
// return value with a promise in JS
RCT_REMAP_METHOD(getBadgeValue, resolver: (RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSUInteger badgeValue = [UIApplication sharedApplication].applicationIconBadgeNumber;
  // Need to convert Integer to NSNumber object
  NSNumber *badge = [NSNumber numberWithInteger:badgeValue];
  resolve(badge);
}

// clear the badge
RCT_EXPORT_METHOD(clearBadge) {
  PFInstallation *currentInstallation = [PFInstallation currentInstallation];
  if (currentInstallation.badge != 0) {
    currentInstallation.badge = 0;
    [currentInstallation saveEventually];
  }
}

@end
