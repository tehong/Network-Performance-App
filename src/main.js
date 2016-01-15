/**
*  Main program entry
*/
'use strict';
// Program version number
var BeeperVersion = "0.2.3";
import Storage from 'react-native-storage';

var React = require('react-native');
var Parse = require('parse/react-native');
// var Router = require('./Router');
var Router = require('gb-native-router');
var BackButton = require('./components/icons/BackButton');

var {
  StyleSheet,
  AlertIOS,
  Alert,
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
    appVersion: BeeperVersion,
  }
};

module.exports = React.createClass({
  componentWillMount: function() {
    global.storage = storage;
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
