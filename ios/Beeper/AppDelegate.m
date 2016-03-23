/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */


#import "AppDelegate.h"
#import "Intercom/intercom.h"

#import "RCTBridge.h"
#import "RCTJavaScriptLoader.h"
#import "RCTRootView.h"
#import "RCTPushNotificationManager.h"
#import <Parse/Parse.h>
#import "Mixpanel.h"



@interface AppDelegate() <RCTBridgeDelegate, UIAlertViewDelegate>

@end

@implementation AppDelegate {
  RCTBridge *_bridge;
}

// UIApplication *beeperApp = nil;

- (BOOL)application:(__unused UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

  // Initialize Intercom
  [Intercom setApiKey:@"ios_sdk-7ae58685589f103d3d3f713d1321839ae6c1cdd8" forAppId:@"vhbvbnbs"];

  _bridge = [[RCTBridge alloc] initWithDelegate:self
                                  launchOptions:launchOptions];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:_bridge
                                                   moduleName:@"Beeper"
                                            initialProperties:nil];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  // manually set the TextField tintColor to white
  [[UITextField appearance] setTintColor:[UIColor whiteColor]];


  // iOS push notification registration - see ParseInit!!!

    return YES;
}

// register push (from Intercom) - no need with Parse register the device already - see ParseInit

/* push notification */

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{

  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  // Intercom push
  [Intercom setDeviceToken:deviceToken];

  // Store the deviceToken in the current installation and save it to Parse.
  PFInstallation *installation = [PFInstallation currentInstallation];
  [installation setDeviceTokenFromData:deviceToken];
  installation.channels = @[ @"Beeper" ];
  [installation saveInBackground];

  // Mixpanel token
  Mixpanel *mixpanel = [Mixpanel sharedInstance];
  [mixpanel.people addPushDeviceToken:deviceToken];

  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];

}
// Required for the notification event.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{
  // Note: commenting out the PFPush.handlePush() disallowed in-app remote notification pop up
  //   see  http://stackoverflow.com/questions/29585480/how-an-i-prevent-the-uialertview-from-appearing-when-a-push-notification-is-rece
  // [PFPush handlePush:userInfo];
  //  Since we commented out the PFPush.handlePush() => we still can add the badge number with this code below
  /*    However, adding the folowing code didn't make a difference
  if ([userInfo objectForKey:@"badge"]) {
    long badgeNumber = [[userInfo objectForKey: @"badge"] integerValue];
    application.applicationIconBadgeNumber = badgeNumber;
  }
   */

  // We don't need this one since this is for iOS and we have React Native already below
  // [[NSNotificationCenter defaultCenter] postNotificationName:@"RemoteNotificationReceived" object:self userInfo:userInfo];
  [RCTPushNotificationManager didReceiveRemoteNotification:userInfo];
}


#pragma mark - RCTBridgeDelegate

- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge
{
  NSURL *jsCodeLocation;

  /**
   * Loading JavaScript code - uncomment the one you want.
   *
   * OPTION 1
   * Load from development server. Start the server from the repository root:
   *
   * $ react-native start
   *
   * To run on device, change `localhost` to the IP address of your computer
   * (you can get this by typing `ifconfig` into the terminal and selecting the
   * `inet` value under `en0:`) and make sure your computer and iOS device are
   * on the same Wi-Fi network.
   */

  jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle.bundle?platform=ios&dev=true"];

  /**
   * OPTION 2
   * Load from pre-bundled file on disk. To re-generate the static bundle
   * from the root of your project directory, run
   *
   * $ react-native bundle --minify
   *
   * see http://facebook.github.io/react-native/docs/runningondevice.html
   */

  // jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];

  
  return jsCodeLocation;
}


- (void)loadSourceForBridge:(RCTBridge *)bridge
                  withBlock:(RCTSourceLoadBlock)loadCallback
{
  [RCTJavaScriptLoader loadBundleAtURL:[self sourceURLForBridge:bridge]
                            onComplete:loadCallback];
}

@end
