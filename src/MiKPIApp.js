/**
* 3Ten8 Mi-KPI react native app
* https://github.com/facebook/react-native
* https://github.com/3TEN8/MI-KPIApp.git
*/
'use strict';

var MiKPIVersion = "0.0.6";

var React = require('react-native');
// var Router = require('./Router');
var Router = require('gb-native-router');
var BackButton = require('./components/icons/BackButton');

var {
  AppRegistry,
  StyleSheet,
} = React;

var LoginScreen = require('./LoginScreen');

var firstRoute = {
  name: '',
  component: LoginScreen,
  hideNavigationBar: true,
  trans: true,
  passProps: {
    appVersion: MiKPIVersion,
  }
};

var MiKPI = React.createClass({
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

AppRegistry.registerComponent('MiKPI', () => MiKPI);

module.exports = MiKPI;
