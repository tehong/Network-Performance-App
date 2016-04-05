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

#import "RCTRootView.h"
#import "RCTPushNotificationManager.h"
#import <Parse/Parse.h>
#import "Mixpanel.h"
#import "ReactNativeAutoUpdater.h"

#define JS_CODE_METADATA_URL @"https://raw.githubusercontent.com/3TEN8/autoupdater/master/b/b33p3r/update.json"

/* Test autoupdater setup
#define JS_CODE_METADATA_URL @"https://raw.githubusercontent.com/3TEN8/autoupdater/test/b/b33p3r/update.json"
*/

@interface AppDelegate() <ReactNativeAutoUpdaterDelegate>

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  // Initialize Intercom
  [Intercom setApiKey:@"ios_sdk-7ae58685589f103d3d3f713d1321839ae6c1cdd8" forAppId:@"vhbvbnbs"];
  
  // manually set the TextField tintColor to white
  [[UITextField appearance] setTintColor:[UIColor whiteColor]];
  
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

#ifdef DEBUG
  
  NSURL* jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle.bundle?platform=ios&dev=true"];
  
#else

  /**
   * OPTION 2
   * Load from pre-bundled file on disk. To re-generate the static bundle
   * from the root of your project directory, run
   *
   * $ react-native bundle --minify
   *
   * see http://facebook.github.io/react-native/docs/runningondevice.html
   */
  
  NSURL* defaultJSCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  
  /**  React Native auto updater NPM:
   * see https://github.com/aerofs/react-native-auto-updater
   *  1. Get an instance of ReactNativeAutoUpdater
   *  2. Set self as a delegate.
   *  3. Initialize with MetadataUrl and defaultJSCodeLocation
   *  4. Make a call to checkUpdate
   *  5. Don't forget to implement the delegate methods
   */
  
  ReactNativeAutoUpdater* updater = [self checkUpdate:defaultJSCodeLocation];
  NSURL* jsCodeLocation = [updater latestJSCodeLocation];
  
#endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"Beeper"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  // [self createReactRootViewFromURL:latestJSCodeLocation];  // from auto-updater sample code, not working for orientation changes!
  [self.window makeKeyAndVisible];
  return YES;

  // iOS push notification registration - see ParseInit!!!
  
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
  
#ifdef DEBUG

#else

  NSURL* defaultJSCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];

  [self checkUpdate:defaultJSCodeLocation];

#endif
  
}

- (ReactNativeAutoUpdater* ) checkUpdate:(NSURL *)defaultJSCodeLocation {

  ReactNativeAutoUpdater* updater = [ReactNativeAutoUpdater sharedInstance];
  [updater setDelegate:self];
  NSURL* defaultMetadataFileLocation = [[NSBundle mainBundle] URLForResource:@"metadata" withExtension:@"json"];
  [updater initializeWithUpdateMetadataUrl:[NSURL URLWithString:JS_CODE_METADATA_URL]
                     defaultJSCodeLocation:defaultJSCodeLocation
               defaultMetadataFileLocation:defaultMetadataFileLocation ];
  
  [updater setHostnameForRelativeDownloadURLs:@"https://raw.githubusercontent.com/3TEN8/autoupdater/master"];
  
  /* Test autoupdater setup
  [updater setHostnameForRelativeDownloadURLs:@"https://raw.githubusercontent.com/3TEN8/autoupdater/test"];
  */
  
  [updater downloadUpdatesForType: ReactNativeAutoUpdaterPatchUpdate];   // any -.-.x patch update is allowed
  [updater allowCellularDataUse: NO];   // no Cellular data shall be used for update
  [updater checkUpdate];
  return updater;
  
}
- (void)createReactRootViewFromURL:(NSURL*)url {
  // Make sure this runs on main thread. Apple does not want you to change the UI from background thread.
  dispatch_async(dispatch_get_main_queue(), ^{
    RCTBridge* bridge = [[RCTBridge alloc] initWithBundleURL:url moduleProvider:nil launchOptions:nil];
    RCTRootView* rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"Beeper" initialProperties:nil];
    self.window.rootViewController.view = rootView;
  });
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

#pragma mark - ReactNativeAutoUpdaterDelegate methods

- (void)ReactNativeAutoUpdater_updateDownloadedToURL:(NSURL *)url
{
  UIAlertController *alertController = [UIAlertController
                                        alertControllerWithTitle:NSLocalizedString(@"Update Downloaded", nil)
                                        message:NSLocalizedString(@"Great news!\nAn update was downloaded. Do you want to apply the update now?", nil)
                                        preferredStyle:UIAlertControllerStyleAlert];
  
  UIAlertAction *cancelAction = [UIAlertAction
                                 actionWithTitle:NSLocalizedString(@"Cancel", @"Cancel action")
                                 style:UIAlertActionStyleCancel
                                 handler:^(UIAlertAction *action)
                                 {
                                   NSLog(@"Cancel action");
                                 }];
  
  UIAlertAction *okAction = [UIAlertAction
                             actionWithTitle:NSLocalizedString(@"OK", @"OK action")
                             style:UIAlertActionStyleDefault
                             handler:^(UIAlertAction *action)
                             {
                               [self createReactRootViewFromURL: url];
                             }];
  
  [alertController addAction:cancelAction];
  [alertController addAction:okAction];
  
  // make sure this runs on main thread. Apple doesn't like if you change UI from background thread.
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.window.rootViewController presentViewController:alertController animated:YES completion:nil];
  });
  
}

- (void)ReactNativeAutoUpdater_updateDownloadFailed
{
  NSLog(@"Update failed to download");
}

@end
