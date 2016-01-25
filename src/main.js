/**
*  Main program entry
*/
'use strict';
// Program version number and customer visible release notes
var BeeperVersion = "0.2.8";
var CustomerReleaseNotes = "\
Release notes:\n\
(1) Fixed a software bug that caused program to exit when the Data Accessibility is showing red in the Sector Details.\
"

import Storage from 'react-native-storage';

var React = require('react-native');
var Parse = require('parse/react-native');
// var Router = require('./Router');
var Router = require('gb-native-router');
var BackButton = require('./components/icons/BackButton');
var RemotePushIOS = require("react-native-remote-push");

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
    global.BeeperVersion = BeeperVersion;
    global.CustomerReleaseNotes = CustomerReleaseNotes;
    PushNotificationIOS.addEventListener('notification', this._onNotification);
  },
  componentWillUnmount: function() {
    PushNotificationIOS.removeEventListener('notification', this._onNotification);
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
