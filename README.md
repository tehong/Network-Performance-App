# iOS-RN-MiKPI

To build the bundle for running on device:

1. In AppDelegate.m:
   a. Comment out OPTION 1:  

   '''
   // jsCodeLocation = [NSURL URLWithString:@"http://10.250.31.56:8081/src/MiKPIApp.bundle?platform=ios&dev=true"];
   '''

   b. Uncomment OPTION 2:

   '''
   jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
   '''

2. On the root directory of the app, build your bundle:

'''
GitHub/RN-iOS-MiKPI  git:(master*) $ react-native bundle --minify --entry-file "./src/MiKPIApp.js" --platform ios --bundle-output ./main.jsbundle --assets-dest /tmp/bundle-assets
'''

3. Add the main.jsbundle in the IOS project by right click on the project directory and "Add files to MiKPI".   You only needs to do this once.  No need to do it later.
