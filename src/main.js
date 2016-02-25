/**
*  Main program entry
*/
'use strict';
// Program version number and customer visible release notes
var CustomerReleaseNotes = "\
(1) Added new tab bar navigation.\n\
(2) Added new Feed screen.\n\
(3) Added new comment box on each KPI list item.\n\
(4) Added push notification and Feed badge number for new comments.\
";

import Storage from 'react-native-storage';

var React = require('react-native');
var Parse = require('parse/react-native');
// var Router = require('./Router');
var Router = require('gb-native-router');
var BackButton = require('./components/icons/BackButton');
var RemotePushIOS = require("react-native-remote-push");
var InfoPlist = require('react-native').NativeModules.InfoPlist;

var {
  StyleSheet,
  AlertIOS,
  Alert,
  PushNotificationIOS,
} = React;

var storage = new Storage({
    // maximum capacity, default 1000
    size: 1000,

    // expire time, default 1 day(1000 * 3600 * 24 secs)
    defaultExpires: 1000 * 3600 * 24,

    // cache data in the memory. default is true.
    enableCache: true,

    // if data was not found in storage or expired,
    // the corresponding sync method will be invoked and return
    // the latest data.
    sync : {
        // we'll talk about the details later.
    }
});

var LoginScreen = require('./LoginScreen');

var firstRoute = {
  name: 'login',
  component: LoginScreen,
  hideNavigationBar: true,
  trans: true,
  passProps: {
  }
};

module.exports = React.createClass({

  componentDidMount: function() {
  },
  componentWillMount: function() {
    global.storage = storage;
    global.CONTROL_KEYS_STORAGE_TOKEN = 'controlKeys';
    global.LOGIN_STORAGE_TOKEN = 'loginInfo';
    global.FEED_STORAGE_TOKEN = 'feedInfo';
    global.CONTROL_KEY_LENGTH = 10;
    global.CustomerReleaseNotes = CustomerReleaseNotes;
    // no event listener
    PushNotificationIOS.addEventListener('notification', this._onNotification);
    global.DEFAULT_PROFILE_IMAGE =  require('./assets/images/Profile_Icon_Large.png');
    this._getAppVersion();
    var mixpanelTrack = require('./utils/mixpanelTrack');
    mixpanelTrack("App Launch", {"App Version": global.BeeperVersion}, null);
  },
  componentWillUnmount: function() {
    PushNotificationIOS.removeEventListener('notification', this._onNotification);
  },
  _getAppVersion: async function() {
    try {
      global.BeeperVersion = await InfoPlist.bundleShortVersion();
    } catch(e) {
      console.error(e);
    }
  },
  _onNotification(notification) {
    // refresh the Feed badge count
    if (global.refreshFeedCount) {
      global.refreshFeedCount();
    }
    if (global.refreshFeed) {
      global.refreshFeed();
    }
    // No need for extra alert from the app, OS alread dit it
    /*
    AlertIOS.alert(
      'Notification Received',
      'Alert message: ' + notification.getMessage(),
      [{
        text: 'Dismiss',
        onPress: null,
      }]
    );
    */
  },
  render: function() {
    return (
      <Router
        firstRoute={firstRoute}
        headerStyle={styles.header}
        backButtonComponent={BackButton}
      />
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#066D7E",
    // backgroundColor: "white",
  },
});
