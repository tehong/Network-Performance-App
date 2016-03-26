# RN-iOS-Beeper

- To build the bundle to run in xCode mode on an iOS simulator or an iOS device:

  - On xCode:  Product => Scheme => Edit Scheme (Command + <), set the "Build Configuration" to
    "Debug" so "DEBUG" preprocessor directive is defined.  


- To change the version of the app, do the following:

  1. In the Xcode Info.plist => change the "Bundle version string, short" to the same version string.

  2. After the version string are changed, the app is ready to be released vis TestFlight or OTA (if only had JS changes).

- To build for App Store release:

  In AppDelegate.m:

    1. There are two options that you can choose to do:

     a. Debug option

     b. Release option

    2. On xCode:  Product => Scheme => Edit Scheme (Command + <), set the "Build Configuration" to "Release" so debug mode can be set to off.  

    3. Changed the info.plist "Bundle version string. short" to the right release number and, if needed, change the "Bundle version" to a build number for the release.

    4. Modify the metadata.json file to indicate what container version is.  (e.g. "version" : 1.3.0) and also the minContainerVersion - which version that the app can start with to be able to do OTA.  (e.g. "minContainerVersion": "1.3").  So this release will only allow anything version >= 1.3.0 to be OTA into this app.

    5. Build and test on a device and then you can do Product => Archive for submission providing you have the right app certificate and profile.

- To build bundle for the OTA update
  ( NOTE: this only applies to JS changes and also no major feature that might upset Apple's guideline)

  In AppDelegate.m:

    1. Do the same thing to build the release app as app store submission (see above)

    2. On the root directory of the app, build your bundle using .make_bundle:

    > ./make_bundle

    3. Clone the https://github.com/3TEN8/autoupdater.git into a GitHub directory of your choice.

    4. Copy the ./release/main.jsbundle to the autoupdater ./b/b33p3r directory.

    5. Modify the update.json in the ./b/b33p3r directory to the right version and minContainerVersion of the just copied main.jsbundle.

    6. Commit the new update.json and main.jsbundle to the https://github.com/3TEN8/autoupdater.git.  This completes the upload of the new OTA bundle and configuration.  Any Beeper app release with earlier version and with minContainerVersion will perform OTA update when it runs next time from the app drawer.

- Parse:

  1. Push Notification setup:
    See JWindey's answer here: http://stackoverflow.com/questions/29683720/react-native-push-notifications-parse

  2. Recurring push:
    (1) See here to set up some cloud code:  https://www.parse.com/docs/cloudcode/guide#jobs
       # parse new
       # parse deploy or >parse deploy target  (i.e. >parse deploy "Beeper - Thumb")
       - account key: We9kpiwfr4K9gHhQDEo4a1PptNIHTUSQSj4kPYJi

    (2) Test the cloud code for beeper morning reminder using Dev App ID and Keys:

      curl -X POST \
       -H "X-Parse-Application-Id: Df3vSYw5LPzc8ETCwflAdhkq9NFplAmuApK600Go" \
       -H "X-Parse-Master-Key: mwImOQZ5y5ItO15hlzEGllliYdY3xFYYh2tUtw2v" \
       -H "Content-Type: application/json;charset=utf-8" \
      -d '{"action":"send"}' \
      https://api.parse.com/1/jobs/morningReminder

- NPM package mods:

  (1) "react-native-refreshable-listview" => Need to modify the "ListView" component in the packages to "SGListView" component to reduce memory usage.  see node_modules/react-native-refreshable-listview/lib/ListView.js
