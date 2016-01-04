/**
*  Main program entry
*/
'use strict';
// Program version number
var BeeperVersion = "0.1.8";

var React = require('react-native');
var Parse = require('parse/react-native');
// var Router = require('./Router');
var Router = require('gb-native-router');
var BackButton = require('./components/icons/BackButton');

var {
  StyleSheet,
} = React;

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
    // initialize Parse with App Key and JS Key
    Parse.initialize("Df3vSYw5LPzc8ETCwflAdhkq9NFplAmuApK600Go", "8TX1uMCvgzSNKM0kUxeLYpRC19CzTEpCxhvciiVj");
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
