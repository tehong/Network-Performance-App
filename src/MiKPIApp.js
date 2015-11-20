/**
* 3Ten8 Mi-KPI react native app
* https://github.com/facebook/react-native
* https://github.com/3TEN8/MI-KPIApp.git
*/
'use strict';

var React = require('react-native');
var Router = require('./Router');
var {
  AppRegistry,
  StyleSheet,
} = React;

// var TransitionScreen = require('./TransitionScreen');
var LoginScreen = require('./LoginScreen');

var firstRoute = {
  name: '',
  // component: TransitionScreen
  component: LoginScreen
};

var MiKPI = React.createClass({
  render: function() {
    return (
      <Router
        firstRoute={firstRoute}
        headerStyle={styles.header}
        hideNavigationBar={false}
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

  },
});

AppRegistry.registerComponent('MiKPI', () => MiKPI);

module.exports = MiKPI;
