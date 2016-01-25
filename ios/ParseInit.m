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
RCT_EXPORT_METHOD(init:(NSString *)appId key: (NSString *)appKey) {
  
  // NSLog(@"%@ %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd));
  
  [Parse setApplicationId:appId clientKey:appKey];
  
  
  UIUserNotificationType userNotificationTypes = (UIUserNotificationTypeAlert |
                                                  UIUserNotificationTypeBadge |
                                                  UIUserNotificationTypeSound);
  UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:userNotificationTypes
                                                                           categories:nil];
  [beeperApp registerUserNotificationSettings:settings];
  [beeperApp registerForRemoteNotifications];

  // PARSE: Subscribe to Beeper channel.
  /*
  PFInstallation *currentInstallation = [PFInstallation currentInstallation];
  [currentInstallation addUniqueObject:@"Beeper" forKey:@"channels"];
  [currentInstallation saveInBackground];
  */
}

@end
