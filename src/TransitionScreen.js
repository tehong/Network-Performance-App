/**
* 3Ten8 Mi-KPI react native app
* https://github.com/facebook/react-native
* https://github.com/3TEN8/MI-KPIApp.git
*/

//*  NOTE:  this screne is to used to turn off the NavigationBar and transit to login screen

'use strict';

var React = require('react-native');
var {
  Platform,
  AppRegistry,
  StyleSheet,
  Text,
} = React;

var LoginScreen = require('./LoginScreen');

var TransitionScreen = React.createClass({
  componentWillMount: function() {
    if (Platform.OS === 'ios') {
      this.props.toRoute({
        component: LoginScreen,
        trans: true,
        hideNavigationBar: true,
      });
    }
  },
  render: function() {
    return <Text>User is not supposed to be here</Text>
  }
});

AppRegistry.registerComponent('TransitionScreen', () => TransitionScreen);

module.exports = TransitionScreen;
