# iOS-RN-MiKPI

- To build the bundle to run in xCode mode on an iOS simulator or an iOS device:

  In AppDelegate.m:

    a. Uncomment OPTION 1 (for running from xCode on iOS simulator or a iOS device):  

     '''
     jsCodeLocation = [NSURL URLWithString:@"http://localhost/src/MiKPIApp.bundle?platform=ios&dev=true"];
     '''

      *To run on iOS device, you need to change the "localhost" to your computer's IP address that's running on the same subnet of the running device*

      *To enable Chrome DevTools when running on iOS device, you also need to change the "localhost" in "RCTWebSocketExecutor.m" to your computer's network IP address that's on the same subnet of the device.*

    b. Comment out other "jsCodeLocation" Options - i.e. comment out OPTION 2 for running bundle on device or OPTION 3 for running bundle and AppHub on deive, including any AppHub related code such as "AHBuild...." line.

- To build the bundle to run in standalone mode on an iOS device:

  In AppDelegate.m:

   1. There are two options that you can choose to do:

     a. Uncomment OPTION 2 and comment out other OPTIONs for device bunle only build:

     '''
     jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
     '''
     b. Uncomment OPTION 3 and comment out other OPTIONs for both device bundle and AppHub build:

     '''
     jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
     '''

    2. On the root directory of the app, build your bundle:

      '''
      GitHub/RN-iOS-MiKPI  git:(master*) $ react-native bundle --minify --entry-file "./src/MiKPIApp.js" --platform ios --bundle-output ./main.jsbundle --assets-dest /tmp/bundle-assets
      '''

    3. Add the main.jsbundle in the IOS project by right click on the project directory and "Add files to MiKPI".   *You only needs to do this once.  No need to do it a second time.*

- To submit to AppNub for distribution:

  1. Enable OPTION 3 and disable all other OPTIONs.
  
  2. Follow the quickstart guide to archive and export and IPA file from Xcode and upload to AppHub.  See https://dashboard.apphub.io/projects/WXeP33Qfj3DZiQWQThOr/quickstart
