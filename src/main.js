/**
*  Main program entry
*/
'use strict';
// Program version number and customer visible release notes
var CustomerReleaseNotes = "\
(1) Removed the DA/DR/UT/DT icons in the app and changed the ordering of the thresholds to Red => Yellow => Green.\n\
(2) Added iOS push notification in the app and a morning reminder via server code.\n\
(3) Added the ability to change profile photo and auto-sync the profile photo from and to the server.\n\
(4) Added the ability to logout by the user in the user profile.\n\
(5) Added auto-login within 24 hours window of activity.\n\
(6) Added the ability to drill down from the network page to specific sector color (red/green/yellow only for now) via the sector count.\n\
(7) Revised the forgotten username/password to ask for a full name to get instant chat support.\n\
(8) Added software version and release notes in the user profile.\n\
(9) Added auto-logout when app ID and Key are changed in the user profile\n\
(10) Miscellanous UI tweaks.\n\
(11) Added pull-to-refresh for all the views of KPI list.\n\
(12) Replaced dailay average dotted chart on KPI chart with green threshold on chart.\
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
  name: '',
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
    global.CONTROL_KEY_LENGTH = 10;
    global.CustomerReleaseNotes = CustomerReleaseNotes;
    PushNotificationIOS.addEventListener('notification', this._onNotification);
    global.DEFAULT_PROFILE_IMAGE =  require('./assets/images/Profile_Icon_Large.png');
    this._getAppVersion();
    var mixpanelTrack = require('./components/mixpanelTrack');
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
    AlertIOS.alert(
      'Notification Received',
      'Alert message: ' + notification.getMessage(),
      [{
        text: 'Dismiss',
        onPress: null,
      }]
    );
  },
  render: function() {
    /*
    var appIdAlert = AlertIOS.alert(
        'Application ID',
        'Please enter the Application ID given to you',
        [
          {text: 'Submit', onPress: (text) => this.saveAppID(text)},
        ],
        'plain-text',
      );
    var appKeyAlert =
      AlertIOS.alert(
        'Application Key',
        'Please enter the Application Key given to you',
        [
          {text: 'Submit', onPress: (text) => this.saveAppKey(text)},
        ],
        'plain-text',
      );
      */
        // backButtonComponent={BackButton}
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
